import { createClient } from "@supabase/supabase-js";
import { ChatOpenAI } from "@langchain/openai/";
import { ChatPromptTemplate } from "@langchain/core/prompts/";
import { StringOutputParser } from "@langchain/core/output_parsers/";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase/";
import { formatDocumentsAsString } from "langchain/util/document/";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables/";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const llm = new ChatOpenAI({
  apiKey: OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
  temperature: 0,
});

const session = new Supabase.ai.Session("gte-small");

class Embeddings {
  private session: Supabase.ai.Session;

  constructor(session: Supabase.ai.Session) {
    this.session = session;
  }

  async embedQuery(query: string): Promise<Number[]> {
    const embeddings = await this.session.run(query, {
      mean_pool: true,
      normalize: true,
    });
    return embeddings;
  }
}

const embeddings = new Embeddings(session);

Deno.serve(async (req) => {
  const { question } = await req.json();

  if (!question) {
    return new Response(
      JSON.stringify({ error: true, message: "please provide a question" }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  const prompt =
    ChatPromptTemplate.fromTemplate(`You are helpful AI assistant to answer the user questions from a given context.\
   If you don't know the answer, don't make it yourself and say you don't know about it.
    <context>
    {context}
    </context>

    Question: {question}
    Answer: Helpful answer in markdown language.
  `);

  const vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, {
    client: supabaseClient,
    queryName: "match_document_embeddings",
    tableName: "document_embeddings",
  });

  const retriever = vectorStore.asRetriever(5);

  const chain = RunnableSequence.from([
    {
      question: new RunnablePassthrough(),
      context: retriever.pipe(formatDocumentsAsString),
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  const response = await chain.invoke(question);

  return new Response(JSON.stringify({ answer: response }), {
    headers: { "Content-Type": "application/json" },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/rag-bot' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
