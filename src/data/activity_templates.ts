import guid from "../utils/guid";
import {isNullOrUndefined} from "util";

export function assessmentTemplate(title: string) {
  if(isNullOrUndefined(title) || title === ''){
    throw "Title cannot be empty";
  }
  const id = title.split(" ")[0] + guid();
  return {
    "assessment": {
      "@id": id,
      "#array": [
        {
          "title": {
            "#text": title
          }
        },
        {
          "short_title": {
            "#text": "reveal"
          }
        },
        {
          "content": {
            "p": {
              "#array": [
                {
                  "#text": "Review the Policy Statement, Privileges and Responsibilities and Misuse and Inappropriate Behavior sections of the Computing Policy, then answer the following questions."
                }
              ]
            }
          }
        },
        {
          "question": {
            "@id": id+"_1a",
            "#array": [
              {
                "body": {
                  "#text": "Albert sees that his girlfriend has written her password on a note beside her computer; he logs in and sends a joke email to one of her friends. This action is: "
                }
              },
              {
                "multiple_choice": {
                  "@shuffle": "false",
                  "@id": "ans",
                  "#array": [
                    {
                      "choice": {
                        "@value": "yes",
                        "#text": "Acceptable"
                      }
                    },
                    {
                      "choice": {
                        "@value": "no",
                        "#text": "Unacceptable"
                      }
                    }
                  ]
                }
              },
              {
                "part": {
                  "#array": [
                    {
                      "response": {
                        "@match": "yes",
                        "@score": "0",
                        "feedback": {
                          "#text": "Incorrect; using another student?s password is not acceptable, even if it?s left out in the open. Further, Albert has assumed his girlfriend's identity by using her account, which is also a violation of the Computing Policy."
                        }
                      }
                    },
                    {
                      "response": {
                        "@match": "no",
                        "@score": "1",
                        "feedback": {
                          "#text": "Correct; this is a pretty clear violation of the policy, including using another person?s account and impersonating another individual."
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  }
}