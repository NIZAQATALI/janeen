

export const BADGE_RULES = [
  {
    code: "FIRST_LOGIN",
    condition: ({ loginCount }) => loginCount >= 1,
  },
  {
    code: "READER",
    condition: ({ blogsRead }) => blogsRead >= 10,
  },
  {
    code: "WRITER",
    condition: ({ blogsCreated }) => blogsCreated >= 5,
  },
  {
    code: "POINT_MASTER",
    condition: ({ points }) => points >= 500,
  },
];
