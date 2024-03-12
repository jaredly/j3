return {type: 'bootstrap', stmts: [
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
    "type": "sexpr",
    "loc": 93
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
    "type": "sexpr",
    "loc": 66
  },
  {
    "0": {
      "0": {
        "0": 123,
        "type": "pint"
      },
      "type": "eprim"
    },
    "type": "sexpr",
    "loc": 125
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
    "type": "sexpr",
    "loc": 103
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
    "type": "sexpr",
    "loc": 109
  }
]}