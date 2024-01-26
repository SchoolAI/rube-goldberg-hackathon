import OpenAI from "openai";

const openai = new OpenAI();

async function refineWithLLM(searchedItem, image_url) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `does this image have the item :${searchedItem} circled?` },
          {
            type: "image_url",
            image_url: {
              "url": image_url,
            },
          },
        ],
      },
    ],
  });

  const decision = response.choices[0].text;

  if (decision === "yes") {
    return true;
  } else {
    await searchWithLLM(searchedItem, image_url)
  }

}
export async function searchWithLLM(search: string, image_url: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: search },
          {
            type: "image_url",
            image_url: {
              "url": image_url,
            },
          },
        ],
      },
    ],
  });

  const circled_image_url = await circleCoordinates(response.choices[0].text, image_url);
  const decision = await refineWithLLM(search, circled_image_url);
  console.log(response.choices[0]);
}
