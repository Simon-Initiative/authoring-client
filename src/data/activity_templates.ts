import guid from '../utils/guid';
import { isNullOrUndefined } from 'util';

export function assessmentTemplate(title: string) {
  if (isNullOrUndefined(title) || title === '') {
    throw 'Title cannot be empty';
  }
  const g = guid();
  const id = title.toLowerCase().split(' ')[0] + g.substring(g.lastIndexOf('-'));
  return {
    assessment: {
      '@id': id,
      '#array': [
        {
          title: {
            '#text': title,
          },
        },
        {
          content: {
            '#array': [
              {
                p: {
                  '#array': [
                    {
                      em: {
                        '@style': 'emphasis',
                        '#text': 'THIS IS EXAMPLE SUPPORTING CONTENT. PLEASE EDIT OR DELETE IT.',
                      },
                    },
                  ],
                  '@id': 'd81b20d521a04762b805bad4e107dea0',
                  '@title': '',
                },
              },
              {
                p: {
                  '#array': [
                    {
                      '#text': 'Review the Policy Statement, Privileges and Responsibilities and '
                        + 'Misuse and Inappropriate Behavior sections of the Computing Policy, '
                        + 'then answer the following questions.',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          question: {
            '@id': id + '_1a',
            '#array': [
              {
                body: {
                  '#array': [
                    {
                      p: {
                        '#array': [
                          {
                            em: {
                              '@style': 'emphasis',
                              '#text': 'THIS IS AN EXAMPLE MULTIPLE CHOICE QUESTION. '
                                + 'PLEASE EDIT OR DELETE IT.',
                            },
                          },
                        ],
                        '@id': 'ef7c8106d0e141bb9a63bc981385b751',
                        '@title': '',
                      },
                    },
                    {
                      p: {
                        '#text': 'Albert sees that his girlfriend has written her password '
                          + 'on a note beside her computer; he logs in and sends a joke email to '
                          + 'one of her friends. This action is: ',
                        '@id': 'ac24c7868c7f24c9a8877494035036e09',
                        '@title': '',
                      },
                    },
                  ],
                },
              },
              {
                multiple_choice: {
                  '@shuffle': 'false',
                  '@id': 'ans',
                  '#array': [
                    {
                      choice: {
                        '@value': 'yes',
                        '#text': 'Acceptable',
                      },
                    },
                    {
                      choice: {
                        '@value': 'no',
                        '#text': 'Unacceptable',
                      },
                    },
                  ],
                },
              },
              {
                part: {
                  '#array': [
                    {
                      response: {
                        '@match': 'yes',
                        '@score': '0',
                        feedback: {
                          '#text': 'Incorrect; using another student\'s password is not '
                            + 'acceptable, even if it\'s left out in the open. Further, '
                            + 'Albert has assumed his girlfriend\'s identity by using her '
                            + 'account, which is also a violation of the Computing Policy.',
                        },
                      },
                    },
                    {
                      response: {
                        '@match': 'no',
                        '@score': '1',
                        feedback: {
                          '#text': 'Correct; this is a pretty clear violation of the policy, '
                            + 'including using another person\'s account and impersonating another '
                            + 'individual.',
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}
