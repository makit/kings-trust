import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import { bedrock } from "@cdklabs/generative-ai-cdk-constructs";
import { AgentAlias } from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";

// Demonstration stack for Bedrock Agents with knowledge bases and a simple orchestrator agent

export class AgentsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Knowledge base buckets
    const kbS31 = new s3.Bucket(this, "KnowledgeBaseBucketOne", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const kbS32 = new s3.Bucket(this, "KnowledgeBaseBucketTwo", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const eventKb = new bedrock.VectorKnowledgeBase(
      this,
      "EventKnowledgeBase",
      {
        embeddingsModel:
          bedrock.BedrockFoundationModel.TITAN_EMBED_TEXT_V2_1024,
        instruction:
          "Use the data to answer questions about events and related information.",
      }
    );

    const kingsTrustKb = new bedrock.VectorKnowledgeBase(
      this,
      "KingsTrustKnowledgeBase",
      {
        embeddingsModel:
          bedrock.BedrockFoundationModel.TITAN_EMBED_TEXT_V2_1024,
        instruction:
          "Use the data to answer questions about the Kings Trust organization.",
      }
    );

    new bedrock.S3DataSource(this, "DataSource", {
      bucket: kbS31,
      knowledgeBase: eventKb,
      dataSourceName: "events",
      chunkingStrategy: bedrock.ChunkingStrategy.fixedSize({
        maxTokens: 500,
        overlapPercentage: 20,
      }),
    });

    new bedrock.S3DataSource(this, "DataSource", {
      bucket: kbS32,
      knowledgeBase: kingsTrustKb,
      dataSourceName: "kings-trust",
      chunkingStrategy: bedrock.ChunkingStrategy.fixedSize({
        maxTokens: 500,
        overlapPercentage: 20,
      }),
    });

    const eventAgent = new bedrock.Agent(this, "Agent", {
      foundationModel:
        bedrock.BedrockFoundationModel.ANTHROPIC_CLAUDE_HAIKU_V1_0,
      instruction:
        'You are a helpful and friendly agent that answers questions about events using the provided knowledge base. If you do not know the answer, respond with "I do not know."',
    });

    eventAgent.addKnowledgeBase(eventKb);

    const eventAlias = new AgentAlias(this, "EventAlias", {
      agent: eventAgent,
      aliasName: "eventProduction",
    });

    const kingsTrustAgent = new bedrock.Agent(this, "Agent", {
      foundationModel:
        bedrock.BedrockFoundationModel.ANTHROPIC_CLAUDE_HAIKU_V1_0,
      instruction:
        'You are a helpful and friendly agent that answers questions about the Kings Trust organization using the provided knowledge base. If you do not know the answer, respond with "I do not know."',
    });

    kingsTrustAgent.addKnowledgeBase(kingsTrustKb);

    const kingsTrustAlias = new AgentAlias(this, "KingsTrustAlias", {
      agent: kingsTrustAgent,
      aliasName: "kingsTrustProduction",
    });

    new bedrock.Agent(this, "OrchestratorAgent", {
      name: "OrchestratorAgent",
      instruction:
        "You are a helpful assistant that can answer general questions and route specialized customer support questions to the customer support agent.",
      foundationModel: bedrock.BedrockFoundationModel.AMAZON_NOVA_LITE_V1,
      agentCollaboration: bedrock.AgentCollaboratorType.SUPERVISOR,
      agentCollaborators: [
        new bedrock.AgentCollaborator({
          agentAlias: eventAlias,
          collaborationInstruction: "Route event questions to this agent.",
          collaboratorName: "Event",
          relayConversationHistory: true,
        }),
        new bedrock.AgentCollaborator({
          agentAlias: kingsTrustAlias,
          collaborationInstruction:
            "Route Kings Trust questions to this agent.",
          collaboratorName: "KingsTrust",
          relayConversationHistory: true,
        }),
      ],
    });
  }
}
