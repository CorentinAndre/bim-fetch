import { getQuery, getUrl } from "./utils.ts";

const queries = [
  {
    testName: "No query",
    query: {},
    queryString: ""
  },
  {
    testName: "Simple query",
    query: {
      test: 2,
      value: 3,
      string: "true"
    },
    queryString: "?test=2&value=3&string=true"
  },
  {
    testName: "Query with spaces",
    query: {
      name: "Corentin",
      firstName: "Andre",
      hobby: "some hobby with space"
    },
    queryString:
      "?name=Corentin&firstName=Andre&hobby=some%20hobby%20with%20space"
  },
  {
    testName: "Query with accents",
    query: {
      name: "Corentin",
      firstName: "André"
    },
    queryString: "?name=Corentin&firstName=Andr%C3%A9"
  },
  {
    testName: "Query with arrays",
    query: {
      name: "Corentin",
      firstName: "André",
      hobbies: ["surf", "guitar", "climbing"]
    },
    queryString:
      "?name=Corentin&firstName=Andr%C3%A9&hobbies[]=surf&hobbies[]=guitar&hobbies[]=climbing"
  }
];

queries.forEach(({ testName, query, queryString }) => {
  test(`It should convert ${testName} to a query string`, () => {
    expect(getQuery(query)).toBe(queryString);
  });
});

const baseUrl = "https://some-api.com";

const urls = [
  {
    url: "https://should-replace-base-url.com/users",
    expectation: "https://should-replace-base-url.com/users"
  },
  {
    url: "http://should-replace-base-url.com/users",
    expectation: "http://should-replace-base-url.com/users"
  },
  { url: "users", expectation: `${baseUrl}/users` },
  { url: "users/1", expectation: `${baseUrl}/users/1` }
];

urls.forEach(({ url, expectation }) => {
  test(`it should use the correct url for ${url}`, () => {
    expect(getUrl(url, baseUrl)).toBe(expectation);
  });
});
