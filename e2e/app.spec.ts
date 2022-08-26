import { expect, test } from "@playwright/test";
import { expectQueryVisible, expectVisible } from "./utils";

test("page display", async ({ page }) => {
  const find = page.locator.bind(page);
  await page.goto("/");
  await expectVisible(find, "Movie Awards");
  await expectQueryVisible(find, '[placeholder="search a movie title..."]');

  const categories = [
    "Best Picture",
    "Best Director",
    "Best Actor",
    "Best Actress",
    "Best Supporting Actor",
    "Best Supporting Actress",
    "Best Visual Effects",
  ];

  for (const item of categories) {
    await expectVisible(find, item);
  }

  await expectVisible(find, "Submit Votes");
});

test("Display a list of movies grouped by categories ordered alphabetically", async ({ page }) => {
  await page.goto("/");

  const orderedCategory = [
    "Best Actor",
    "Best Actress",
    "Best Director",
    "Best Picture",
    "Best Supporting Actor",
    "Best Supporting Actress",
    "Best Visual Effects",
  ];

  // due to CSR loading simulation
  await new Promise((res) => setTimeout(res, 4000));

  const list = await page.$$(".collapse-title");
  for (let i = 0; i < Array.from(list).length; i += 1) {
    const item = Array.from(list)[i];
    expect(await item.innerText()).toEqual(orderedCategory[i]);
  }
});

test("Search for a movie title", async ({ page }) => {
  const find = page.locator.bind(page);
  await page.goto("/");

  await find("input[placeholder]").fill("tenet");
  await expectVisible(find, "Results: 1");
  await expectQueryVisible(find, '[data-result="tenet"]');
});
