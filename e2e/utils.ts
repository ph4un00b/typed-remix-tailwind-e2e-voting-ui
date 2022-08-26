import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import fs from "fs";

export const BASE_URL = "http://localhost:3000/";

export async function click(page: Page, query: string) {
  await page.locator(query).click();
}

export async function clickFirst(page: Page, query: string) {
  await page.locator(query).nth(0).click();
}

export async function press(page: Page, text: string) {
  await page.locator(`text="${text}"`).click();
}

export async function select(page: Page, text:string) {
  await page.locator(`text="${text}"`).click();
}

export async function selectFirst(page: Page, text:string) {
  await page.locator(`text="${text}"`).nth(0).click();
}

export async function selectSecond(page: Page, text: string) {
  await page.locator(`text="${text}"`).nth(1).click();
}

export async function goto(page: Page, url:string) {
  await page.goto(`${BASE_URL}${url}`, { waitUntil: "networkidle" });
}


export async function expectVisible(find: any, text: string) {
  await expect(find('text="' + text + '"')).toBeVisible();
}

export async function expectH1Visible(find: any, text: string) {
  await expect(find('h1:has-text("' + text + '")')).toBeVisible();
}

export async function expectLinkVisible(find: any, text: string) {
  await expect(find('a:has-text("' + text + '")')).toBeVisible();
}

export async function expectQueryVisible(find: any, query:string) {
  await expect(find(query)).toBeVisible();
}

export async function expectInputValue(find: any, opts: { name: string; value: string; }) {
  await expect(find(`input[name=${opts.name}]`)).toHaveValue(opts.value);
}

export async function expectCookie(page: Page) {
  // if you got a new session token
  // you should change the 'cookies.json' too
  // or you might get an error message
  const cookies = fs.readFileSync("./e2e/cookies.json", "utf8");
  const deserializedCookies = JSON.parse(cookies);
  await page.context().addCookies(deserializedCookies);

  expect(deserializedCookies[0].name).toEqual("__HOLA__");
}