// @ts-ignore
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: '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'
});

async function searchWithLLM(search: string, originalImageUrl: string, currentImageUrl = null, depth = 0) {
  if (depth > 5) { // Limit recursion depth to avoid infinite loops
    console.log("Recursion depth limit reached");
    return false;
  }

  try {
    // Attempt to locate the item and circle it
    let response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Find a small interesting detail in this image in 5 words or less` },
            {
              type: "image_url",
              image_url: { "url": originalImageUrl },
            },
          ],
        },
      ],
    });

    // const circledImageUrl = await circleCoordinates(response.choices[0].message.content, originalImageUrl);

    // Now validate if the item is correctly circled using the circled image
    response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `does this image have the item :${response.choices[0].message.content}?` },
            {
              type: "image_url",
              image_url: { "url": originalImageUrl },
            },
          ],
        },
      ],
    });

    let decision = response.choices[0].text.trim().toLowerCase();

    // If the item is found, return true
    if (decision === "yes") {
      return true;
    }

    // If the item is not found, repeat the process with the updated image URL
    return await searchWithLLM(search, originalImageUrl, circledImageUrl, depth + 1);
  } catch (error) {
    console.error("Error in searchWithLLM:", error);
    throw error;
  }
}

searchWithLLM('eye', 'https://imagedelivery.net/x4t-2RLBwIBx59GMyqLu1g/32bb2258-813b-491a-9331-b2b8f3a71500/public')
export { searchWithLLM };
