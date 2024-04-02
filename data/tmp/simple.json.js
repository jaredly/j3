return {type: 'bootstrap', stmts: [
  {
    "0": "array",
    "1": {
      "0": {
        "0": "cons",
        "1": {
          "0": {
            "0": "a",
            "type": "tcon"
          },
          "1": {
            "0": {
              "0": "a",
              "type": "tcon"
            },
            "1": {
              "type": "nil"
            },
            "type": "cons"
          },
          "type": "cons"
        },
        "type": ","
      },
      "1": {
        "0": {
          "0": "nil",
          "1": {
            "type": "nil"
          },
          "type": ","
        },
        "1": {
          "type": "nil"
        },
        "type": "cons"
      },
      "type": "cons"
    },
    "type": "sdeftype",
    "loc": 189
  },
  {
    "0": {
      "0": "Hello",
      "1": {
        "type": "nil"
      },
      "type": "estr"
    },
    "1": 683,
    "type": "sexpr",
    "loc": 683
  },
  {
    "0": {
      "0": "nil",
      "type": "evar"
    },
    "1": 691,
    "type": "sexpr",
    "loc": 691
  },
  {
    "0": {
      "0": {
        "0": "a",
        "1": {
          "0": {
            "0": "a",
            "type": "evar"
          },
          "1": {
            "0": "",
            "1": {
              "type": "nil"
            },
            "type": "estr"
          },
          "type": "eapp"
        },
        "type": "elambda"
      },
      "1": {
        "0": ",",
        "type": "evar"
      },
      "type": "eapp"
    },
    "1": 537,
    "type": "sexpr",
    "loc": 537
  },
  {
    "0": "lol",
    "1": {
      "0": {
        "0": 10,
        "type": "pint"
      },
      "type": "eprim"
    },
    "type": "sdef",
    "loc": 686
  },
  {
    "0": {
      "0": {
        "0": {
          "0": "+",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": 1,
            "type": "pint"
          },
          "type": "eprim"
        },
        "type": "eapp"
      },
      "1": {
        "0": "hi",
        "type": "evar"
      },
      "type": "eapp"
    },
    "1": 584,
    "type": "sexpr",
    "loc": 584
  },
  {
    "0": "lolfn",
    "1": {
      "0": {
        "0": {
          "0": "+",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": 1,
            "type": "pint"
          },
          "type": "eprim"
        },
        "type": "eapp"
      },
      "1": {
        "0": "hi",
        "type": "evar"
      },
      "type": "eapp"
    },
    "type": "sdef",
    "loc": 593
  },
  {
    "0": "xx",
    "1": {
      "0": "one",
      "1": {
        "0": {
          "0": {
            "0": "+",
            "type": "evar"
          },
          "1": {
            "0": {
              "0": 1,
              "type": "pint"
            },
            "type": "eprim"
          },
          "type": "eapp"
        },
        "1": {
          "0": "one",
          "type": "evar"
        },
        "type": "eapp"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 658
  },
  {
    "0": "hi",
    "1": {
      "0": {
        "0": 10,
        "type": "pint"
      },
      "type": "eprim"
    },
    "type": "sdef",
    "loc": 693
  },
  {
    "0": "hio",
    "1": {
      "0": {
        "0": {
          "0": {
            "0": {
              "0": "lolz",
              "type": "evar"
            },
            "1": {
              "0": {
                "0": 10,
                "type": "pint"
              },
              "type": "eprim"
            },
            "type": "eapp"
          },
          "1": {
            "0": {
              "0": 23,
              "type": "pint"
            },
            "type": "eprim"
          },
          "type": "eapp"
        },
        "1": {
          "0": "aa",
          "type": "evar"
        },
        "type": "eapp"
      },
      "1": {
        "0": "bb",
        "type": "evar"
      },
      "type": "eapp"
    },
    "type": "sdef",
    "loc": 664
  },
  {
    "0": {
      "0": "one",
      "1": {
        "0": {
          "0": 23,
          "type": "pint"
        },
        "type": "eprim"
      },
      "2": {
        "0": {
          "0": "xx",
          "type": "evar"
        },
        "1": {
          "0": "one",
          "type": "evar"
        },
        "type": "eapp"
      },
      "type": "elet"
    },
    "1": 601,
    "type": "sexpr",
    "loc": 601
  },
  {
    "0": {
      "0": {
        "0": {
          "0": "cons",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": 1,
            "type": "pint"
          },
          "type": "eprim"
        },
        "type": "eapp"
      },
      "1": {
        "0": {
          "0": {
            "0": "cons",
            "type": "evar"
          },
          "1": {
            "0": "hi",
            "1": {
              "type": "nil"
            },
            "type": "estr"
          },
          "type": "eapp"
        },
        "1": {
          "0": "nil",
          "type": "evar"
        },
        "type": "eapp"
      },
      "type": "eapp"
    },
    "1": 283,
    "type": "sexpr",
    "loc": 283
  },
  {
    "0": {
      "0": {
        "0": {
          "0": {
            "0": ",",
            "type": "evar"
          },
          "1": {
            "0": {
              "0": 1,
              "type": "pint"
            },
            "type": "eprim"
          },
          "type": "eapp"
        },
        "1": {
          "0": {
            "0": 2,
            "type": "pint"
          },
          "type": "eprim"
        },
        "type": "eapp"
      },
      "1": {
        "0": {
          "0": {
            "0": ",",
            "1": {
              "0": {
                "0": "a",
                "type": "pvar"
              },
              "1": {
                "0": {
                  "0": ",",
                  "1": {
                    "0": {
                      "0": "b",
                      "type": "pvar"
                    },
                    "1": {
                      "0": {
                        "0": "",
                        "type": "pstr"
                      },
                      "1": {
                        "type": "nil"
                      },
                      "type": "cons"
                    },
                    "type": "cons"
                  },
                  "type": "pcon"
                },
                "1": {
                  "type": "nil"
                },
                "type": "cons"
              },
              "type": "cons"
            },
            "type": "pcon"
          },
          "1": {
            "0": {
              "0": 1,
              "type": "pint"
            },
            "type": "eprim"
          },
          "type": ","
        },
        "1": {
          "type": "nil"
        },
        "type": "cons"
      },
      "type": "ematch"
    },
    "1": 480,
    "type": "sexpr",
    "loc": 480
  },
  {
    "0": "foldr",
    "1": {
      "0": "init",
      "1": {
        "0": "items",
        "1": {
          "0": "f",
          "1": {
            "0": {
              "0": "items",
              "type": "evar"
            },
            "1": {
              "0": {
                "0": {
                  "0": "nil",
                  "1": {
                    "type": "nil"
                  },
                  "type": "pcon"
                },
                "1": {
                  "0": "init",
                  "type": "evar"
                },
                "type": ","
              },
              "1": {
                "0": {
                  "0": {
                    "0": "cons",
                    "1": {
                      "0": {
                        "0": "one",
                        "type": "pvar"
                      },
                      "1": {
                        "0": {
                          "0": "rest",
                          "type": "pvar"
                        },
                        "1": {
                          "type": "nil"
                        },
                        "type": "cons"
                      },
                      "type": "cons"
                    },
                    "type": "pcon"
                  },
                  "1": {
                    "0": {
                      "0": {
                        "0": "f",
                        "type": "evar"
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": {
                              "0": "foldr",
                              "type": "evar"
                            },
                            "1": {
                              "0": "init",
                              "type": "evar"
                            },
                            "type": "eapp"
                          },
                          "1": {
                            "0": "rest",
                            "type": "evar"
                          },
                          "type": "eapp"
                        },
                        "1": {
                          "0": "f",
                          "type": "evar"
                        },
                        "type": "eapp"
                      },
                      "type": "eapp"
                    },
                    "1": {
                      "0": "one",
                      "type": "evar"
                    },
                    "type": "eapp"
                  },
                  "type": ","
                },
                "1": {
                  "type": "nil"
                },
                "type": "cons"
              },
              "type": "cons"
            },
            "type": "ematch"
          },
          "type": "elambda"
        },
        "type": "elambda"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 0
  },
  {
    "0": {
      "0": "foldr",
      "type": "evar"
    },
    "1": 229,
    "type": "sexpr",
    "loc": 229
  },
  {
    "0": {
      "0": {
        "0": {
          "0": {
            "0": "foldr",
            "type": "evar"
          },
          "1": {
            "0": {
              "0": 0,
              "type": "pint"
            },
            "type": "eprim"
          },
          "type": "eapp"
        },
        "1": {
          "0": {
            "0": {
              "0": "cons",
              "type": "evar"
            },
            "1": {
              "0": {
                "0": 1,
                "type": "pint"
              },
              "type": "eprim"
            },
            "type": "eapp"
          },
          "1": {
            "0": {
              "0": {
                "0": "cons",
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": 2,
                  "type": "pint"
                },
                "type": "eprim"
              },
              "type": "eapp"
            },
            "1": {
              "0": "nil",
              "type": "evar"
            },
            "type": "eapp"
          },
          "type": "eapp"
        },
        "type": "eapp"
      },
      "1": {
        "0": "+",
        "type": "evar"
      },
      "type": "eapp"
    },
    "1": 93,
    "type": "sexpr",
    "loc": 93
  },
  {
    "0": "what",
    "1": {
      "0": "f",
      "1": {
        "0": {
          "0": {
            "0": "f",
            "type": "evar"
          },
          "1": {
            "0": {
              "0": "what",
              "type": "evar"
            },
            "1": {
              "0": "f",
              "type": "evar"
            },
            "type": "eapp"
          },
          "type": "eapp"
        },
        "1": {
          "0": {
            "0": 1,
            "type": "pint"
          },
          "type": "eprim"
        },
        "type": "eapp"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 231
  },
  {
    "0": {
      "0": "what",
      "type": "evar"
    },
    "1": 247,
    "type": "sexpr",
    "loc": 247
  },
  {
    "0": {
      "0": {
        "0": {
          "0": {
            "0": "cons",
            "type": "evar"
          },
          "1": {
            "0": {
              "0": 1,
              "type": "pint"
            },
            "type": "eprim"
          },
          "type": "eapp"
        },
        "1": {
          "0": {
            "0": {
              "0": "cons",
              "type": "evar"
            },
            "1": {
              "0": {
                "0": 2,
                "type": "pint"
              },
              "type": "eprim"
            },
            "type": "eapp"
          },
          "1": {
            "0": "nil",
            "type": "evar"
          },
          "type": "eapp"
        },
        "type": "eapp"
      },
      "1": {
        "0": {
          "0": {
            "0": "nil",
            "1": {
              "type": "nil"
            },
            "type": "pcon"
          },
          "1": {
            "0": {
              "0": 1,
              "type": "pint"
            },
            "type": "eprim"
          },
          "type": ","
        },
        "1": {
          "0": {
            "0": {
              "0": "cons",
              "1": {
                "0": {
                  "0": "a",
                  "type": "pvar"
                },
                "1": {
                  "0": {
                    "0": "asd",
                    "type": "pvar"
                  },
                  "1": {
                    "type": "nil"
                  },
                  "type": "cons"
                },
                "type": "cons"
              },
              "type": "pcon"
            },
            "1": {
              "0": {
                "0": 2,
                "type": "pint"
              },
              "type": "eprim"
            },
            "type": ","
          },
          "1": {
            "type": "nil"
          },
          "type": "cons"
        },
        "type": "cons"
      },
      "type": "ematch"
    },
    "1": 109,
    "type": "sexpr",
    "loc": 109
  },
  {
    "0": {
      "0": {
        "0": {
          "0": true,
          "type": "pbool"
        },
        "type": "eprim"
      },
      "1": {
        "0": {
          "0": {
            "0": {
              "0": false,
              "type": "pbool"
            },
            "type": "pprim"
          },
          "1": {
            "0": {
              "0": 1,
              "type": "pint"
            },
            "type": "eprim"
          },
          "type": ","
        },
        "1": {
          "0": {
            "0": {
              "0": {
                "0": true,
                "type": "pbool"
              },
              "type": "pprim"
            },
            "1": {
              "0": {
                "0": 2,
                "type": "pint"
              },
              "type": "eprim"
            },
            "type": ","
          },
          "1": {
            "type": "nil"
          },
          "type": "cons"
        },
        "type": "cons"
      },
      "type": "ematch"
    },
    "1": 373,
    "type": "sexpr",
    "loc": 373
  },
  {
    "0": {
      "0": {
        "0": {
          "0": "cons",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": 1,
            "type": "pint"
          },
          "type": "eprim"
        },
        "type": "eapp"
      },
      "1": {
        "0": {
          "0": {
            "0": "cons",
            "type": "evar"
          },
          "1": {
            "0": {
              "0": 2,
              "type": "pint"
            },
            "type": "eprim"
          },
          "type": "eapp"
        },
        "1": {
          "0": "nil",
          "type": "evar"
        },
        "type": "eapp"
      },
      "type": "eapp"
    },
    "1": 205,
    "type": "sexpr",
    "loc": 205
  },
  {
    "0": {
      "0": "hello ",
      "1": {
        "0": {
          "0": {
            "0": "folks",
            "1": {
              "type": "nil"
            },
            "type": "estr"
          },
          "1": "",
          "type": ","
        },
        "1": {
          "type": "nil"
        },
        "type": "cons"
      },
      "type": "estr"
    },
    "1": 276,
    "type": "sexpr",
    "loc": 276
  },
  {
    "0": {
      "0": "nil",
      "type": "evar"
    },
    "1": 209,
    "type": "sexpr",
    "loc": 209
  },
  {
    "0": {
      "0": {
        "0": {
          "0": "cons",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": 2,
            "type": "pint"
          },
          "type": "eprim"
        },
        "type": "eapp"
      },
      "1": {
        "0": "nil",
        "type": "evar"
      },
      "type": "eapp"
    },
    "1": 217,
    "type": "sexpr",
    "loc": 217
  },
  {
    "0": {
      "0": {
        "0": {
          "0": "cons",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": 1,
            "type": "pint"
          },
          "type": "eprim"
        },
        "type": "eapp"
      },
      "1": {
        "0": "nil",
        "type": "evar"
      },
      "type": "eapp"
    },
    "1": 211,
    "type": "sexpr",
    "loc": 211
  },
  {
    "0": "lolz",
    "1": {
      "0": "x",
      "1": {
        "0": "y",
        "1": {
          "0": "x",
          "type": "evar"
        },
        "2": {
          "0": {
            "0": {
              "0": "+",
              "type": "evar"
            },
            "1": {
              "0": "x",
              "type": "evar"
            },
            "type": "eapp"
          },
          "1": {
            "0": "y",
            "type": "evar"
          },
          "type": "eapp"
        },
        "type": "elet"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 168
  },
  {
    "0": {
      "0": {
        "0": "lolz",
        "type": "evar"
      },
      "1": {
        "0": {
          "0": 2,
          "type": "pint"
        },
        "type": "eprim"
      },
      "type": "eapp"
    },
    "1": 225,
    "type": "sexpr",
    "loc": 225
  },
  {
    "0": {
      "0": {
        "0": {
          "0": {
            "0": "cons",
            "type": "evar"
          },
          "1": {
            "0": {
              "0": 1,
              "type": "pint"
            },
            "type": "eprim"
          },
          "type": "eapp"
        },
        "1": {
          "0": {
            "0": {
              "0": "cons",
              "type": "evar"
            },
            "1": {
              "0": {
                "0": 2,
                "type": "pint"
              },
              "type": "eprim"
            },
            "type": "eapp"
          },
          "1": {
            "0": "nil",
            "type": "evar"
          },
          "type": "eapp"
        },
        "type": "eapp"
      },
      "type": "equot"
    },
    "1": 103,
    "type": "sexpr",
    "loc": 103
  },
  {
    "0": {
      "0": {
        "0": {
          "0": {
            "0": "1",
            "1": 371,
            "type": "cst/identifier"
          },
          "1": {
            "0": {
              "0": "2",
              "1": 372,
              "type": "cst/identifier"
            },
            "1": {
              "type": "nil"
            },
            "type": "cons"
          },
          "type": "cons"
        },
        "1": 370,
        "type": "cst/array"
      },
      "type": "equot"
    },
    "1": 367,
    "type": "sexpr",
    "loc": 367
  },
  {
    "0": "x",
    "1": {
      "0": "y",
      "type": "evar"
    },
    "type": "sdef",
    "loc": 328
  },
  {
    "0": "y",
    "1": {
      "0": {
        "0": 10,
        "type": "pint"
      },
      "type": "eprim"
    },
    "type": "sdef",
    "loc": 333
  },
  {
    "0": {
      "0": "a",
      "1": {
        "0": "x",
        "type": "evar"
      },
      "2": {
        "0": {
          "0": 2,
          "type": "pint"
        },
        "type": "eprim"
      },
      "type": "elet"
    },
    "1": 340,
    "type": "sexpr",
    "loc": 340
  },
  {
    "0": "even",
    "1": {
      "0": "x",
      "1": {
        "0": {
          "0": {
            "0": {
              "0": "if",
              "type": "evar"
            },
            "1": {
              "0": {
                "0": {
                  "0": "=",
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": 0,
                    "type": "pint"
                  },
                  "type": "eprim"
                },
                "type": "eapp"
              },
              "1": {
                "0": "x",
                "type": "evar"
              },
              "type": "eapp"
            },
            "type": "eapp"
          },
          "1": {
            "0": {
              "0": true,
              "type": "pbool"
            },
            "type": "eprim"
          },
          "type": "eapp"
        },
        "1": {
          "0": {
            "0": "odd",
            "type": "evar"
          },
          "1": {
            "0": {
              "0": {
                "0": "-",
                "type": "evar"
              },
              "1": {
                "0": "x",
                "type": "evar"
              },
              "type": "eapp"
            },
            "1": {
              "0": {
                "0": 1,
                "type": "pint"
              },
              "type": "eprim"
            },
            "type": "eapp"
          },
          "type": "eapp"
        },
        "type": "eapp"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 288
  },
  {
    "0": "odd",
    "1": {
      "0": "x",
      "1": {
        "0": {
          "0": {
            "0": {
              "0": "if",
              "type": "evar"
            },
            "1": {
              "0": {
                "0": {
                  "0": "=",
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": 1,
                    "type": "pint"
                  },
                  "type": "eprim"
                },
                "type": "eapp"
              },
              "1": {
                "0": "x",
                "type": "evar"
              },
              "type": "eapp"
            },
            "type": "eapp"
          },
          "1": {
            "0": {
              "0": true,
              "type": "pbool"
            },
            "type": "eprim"
          },
          "type": "eapp"
        },
        "1": {
          "0": {
            "0": "even",
            "type": "evar"
          },
          "1": {
            "0": {
              "0": {
                "0": "-",
                "type": "evar"
              },
              "1": {
                "0": "x",
                "type": "evar"
              },
              "type": "eapp"
            },
            "1": {
              "0": {
                "0": 1,
                "type": "pint"
              },
              "type": "eprim"
            },
            "type": "eapp"
          },
          "type": "eapp"
        },
        "type": "eapp"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 307
  },
  {
    "0": "l",
    "1": {
      "0": "m",
      "type": "evar"
    },
    "type": "sdef",
    "loc": 442
  },
  {
    "0": "a",
    "1": {
      "0": "m",
      "1": {
        "0": {
          "0": {
            "0": "+",
            "type": "evar"
          },
          "1": {
            "0": {
              "0": "b",
              "type": "evar"
            },
            "1": {
              "0": {
                "0": 2,
                "type": "pint"
              },
              "type": "eprim"
            },
            "type": "eapp"
          },
          "type": "eapp"
        },
        "1": {
          "0": {
            "0": 2,
            "type": "pint"
          },
          "type": "eprim"
        },
        "type": "eapp"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 383
  },
  {
    "0": "b",
    "1": {
      "0": "a",
      "1": {
        "0": {
          "0": "c",
          "type": "evar"
        },
        "1": {
          "0": "a",
          "type": "evar"
        },
        "type": "eapp"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 388
  },
  {
    "0": {
      "0": {
        "0": 23,
        "type": "pint"
      },
      "type": "eprim"
    },
    "1": 435,
    "type": "sexpr",
    "loc": 435
  },
  {
    "0": "c",
    "1": {
      "0": "a",
      "1": {
        "0": {
          "0": "e",
          "type": "evar"
        },
        "1": {
          "0": "a",
          "type": "evar"
        },
        "type": "eapp"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 393
  },
  {
    "0": "e",
    "1": {
      "0": "b",
      "1": {
        "0": {
          "0": "a",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": 2,
            "type": "pint"
          },
          "type": "eprim"
        },
        "type": "eapp"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 398
  },
  {
    "0": {
      "0": "a",
      "type": "evar"
    },
    "1": 408,
    "type": "sexpr",
    "loc": 408
  },
  {
    "0": "m",
    "1": {
      "0": "a",
      "type": "evar"
    },
    "type": "sdef",
    "loc": 437
  }
]}