// @ts-ignore
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const searchWithLLM = async (
  search: string,
  originalImageUrl: string,
  currentImageUrl = null,
  depth = 0
) => {
  if (depth > 5) {
    // Limit recursion depth to avoid infinite loops
    console.log('Recursion depth limit reached');
    return false;
  }

  try {
    // Attempt to locate the item and circle it
    console.log('openai', { url: originalImageUrl });
    let response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: search },
            {
              type: 'image_url',
              image_url: { url: originalImageUrl },
            },
          ],
        },
      ],
    });
    console.log('llm response', JSON.stringify(response, null, 2));
    return response.choices[0].message.content;
  } catch (error) {
    console.log({ error });
  }

  // const circledImageUrl = await circleCoordinates(response.choices[0].message.content, originalImageUrl);

  // Now validate if the item is correctly circled using the circled image
  //   response = await openai.chat.completions.create({
  //     model: "gpt-4-vision-preview",
  //     messages: [
  //       {
  //         role: "user",
  //         content: [
  //           { type: "text", text: `does this match a description of something in the image?: ${response.choices[0].message.content}?` },
  //           {
  //             type: "image_url",
  //             image_url: { "url": originalImageUrl },
  //           },
  //         ],
  //       },
  //     ],
  //   });

  //   let decision = response.choices[0].text.trim().toLowerCase();

  //   // If the item is found, return true
  //   if (decision === "yes") {
  //     return true;
  //   }

  //   // If the item is not found, repeat the process with the updated image URL
  //   return await searchWithLLM(search, originalImageUrl, circledImageUrl, depth + 1);
  // } catch (error) {
  //   console.error("Error in searchWithLLM:", error);
  //   throw error;
  // }
};

// searchWithLLM('eye', 'https://imagedelivery.net/x4t-2RLBwIBx59GMyqLu1g/b9c6ffc3-6a43-4222-5e5f-32c2c6eb3100/public')
// export { searchWithLLM };
