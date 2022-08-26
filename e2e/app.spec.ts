import { test } from "@playwright/test";
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