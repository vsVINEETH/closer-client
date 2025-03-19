import { Message } from "ai";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { cookies } from 'next/headers';

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: Message[] } = await req.json();
    const currentMessageContent = messages[messages.length - 1]?.content;
    const locale = cookies().get('language')?.value || 'en';

    const language = {
      'en':'english',
      'fr':'french',
      'ja':'japanese',
      'de':'german'
    }
    const languageName = language[locale as keyof typeof language];
    if (!currentMessageContent) {
      return new Response(JSON.stringify({ error: "No message provided" }), { status: 400 });
    }

    // Fetch relevant context from the vector search API
    const vectorSearch = await fetch("http://localhost:3000/api/vectorSearch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: currentMessageContent }),
    }).then((res) => res.json());

    const TEMPLATE = `
    You are a very enthusiastic Closer representative who loves to help people! 
    You answer should be in ${languageName}. You be an good friend to the user.
    you should wish the user and you should be ready have conversation with the user 
    with context of the application.
    Answer using only the information provided below in markdown format. 
    If unsure, respond with "Sorry, I don't know how to help with that."
  
    Context:
    ${vectorSearch ? JSON.stringify(vectorSearch, null, 2) : "No context available"}
  
    Question: "${currentMessageContent || 'No question provided'}"
  `;
  

    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      streaming: false,
    });

    const response = await model.invoke([
      new HumanMessage(currentMessageContent),
      new AIMessage(TEMPLATE),
    ]);

    return new Response(JSON.stringify({ response: response.content }), { status: 200 });
  } catch (error) {
    console.error("Error processing chatbot request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}


// import { ChatOpenAI } from '@langchain/openai';
// import { LangChainAdapter, Message } from 'ai';
// import { AIMessage, HumanMessage } from '@langchain/core/messages';

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

// export async function POST(req: Request) {
//   const {
//     messages,
//   }: {
//     messages: Message[];
//   } = await req.json();

//   const model = new ChatOpenAI({
//     model: 'gpt-3.5-turbo-0125',
//     temperature: 0,
//   });

//   const stream = await model.stream(
//     messages.map(message =>
//       message.role == 'user'
//         ? new HumanMessage(message.content)
//         : new AIMessage(message.content),
//     ),
//   );

//   return LangChainAdapter.toDataStreamResponse(stream);
//}