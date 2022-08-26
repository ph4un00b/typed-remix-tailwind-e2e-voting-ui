import { expect, test } from "@playwright/test";
import {
  click,
  clickFirst,
  expectQueryVisible,
  expectVisible,
  press,
} from "./utils";

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

test("Select a movie per category and show 'selected' state", async ({ page }) => {
  const find = page.locator.bind(page);
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

  for (const item of orderedCategory) {
    await click(page, `[data-category="${item}"] >> input[type="checkbox"]`);
    await clickFirst(page, `label[for="vote-${item}"]`);
    await click(page, `[data-category="${item}"] >> input[type="checkbox"]`);
  }

  await press(page, "Submit Votes");

  await expectVisible(find, "Best Actor: chadwick boseman");
  await expectVisible(find, "Best Actress: vanessa kirby");
  await expectVisible(find, "Best Director: chloe zhao");
  await expectVisible(find, "Best Picture: nomadland");
  await expectVisible(find, "Best Supporting Actor: daniel kaluuya");
  await expectVisible(find, "Best Supporting Actress: olivia coleman");
  await expectVisible(find, "Best Visual Effects: midnight sky");
});
