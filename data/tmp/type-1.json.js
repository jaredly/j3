return {type: 'bootstrap', stmts: [
  {
    "0": "ast",
    "1": {
      "0": {
        "0": "# AST",
        "type": "pstr"
      },
      "type": "eprim"
    },
    "type": "sdef",
    "loc": 0
  },
  {
    "0": "array",
    "1": {
      "0": {
        "0": "nil",
        "1": {
          "type": "nil"
        },
        "type": ","
      },
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
          "type": "nil"
        },
        "type": "cons"
      },
      "type": "cons"
    },
    "type": "sdeftype",
    "loc": 469
  },
  {
    "0": "expr",
    "1": {
      "0": {
        "0": "eprim",
        "1": {
          "0": {
            "0": "prim",
            "type": "tcon"
          },
          "1": {
            "type": "nil"
          },
          "type": "cons"
        },
        "type": ","
      },
      "1": {
        "0": {
          "0": "evar",
          "1": {
            "0": {
              "0": "string",
              "type": "tcon"
            },
            "1": {
              "type": "nil"
            },
            "type": "cons"
          },
          "type": ","
        },
        "1": {
          "0": {
            "0": "elambda",
            "1": {
              "0": {
                "0": "string",
                "type": "tcon"
              },
              "1": {
                "0": {
                  "0": "expr",
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
              "0": "eapp",
              "1": {
                "0": {
                  "0": "expr",
                  "type": "tcon"
                },
                "1": {
                  "0": {
                    "0": "expr",
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
                "0": "elet",
                "1": {
                  "0": {
                    "0": "string",
                    "type": "tcon"
                  },
                  "1": {
                    "0": {
                      "0": "expr",
                      "type": "tcon"
                    },
                    "1": {
                      "0": {
                        "0": "expr",
                        "type": "tcon"
                      },
                      "1": {
                        "type": "nil"
                      },
                      "type": "cons"
                    },
                    "type": "cons"
                  },
                  "type": "cons"
                },
                "type": ","
              },
              "1": {
                "0": {
                  "0": "ematch",
                  "1": {
                    "0": {
                      "0": "expr",
                      "type": "tcon"
                    },
                    "1": {
                      "0": {
                        "0": {
                          "0": "pat",
                          "type": "tcon"
                        },
                        "1": {
                          "0": "expr",
                          "type": "tcon"
                        },
                        "type": "tapp"
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
                  "type": "nil"
                },
                "type": "cons"
              },
              "type": "cons"
            },
            "type": "cons"
          },
          "type": "cons"
        },
        "type": "cons"
      },
      "type": "cons"
    },
    "type": "sdeftype",
    "loc": 483
  },
  {
    "0": "prim",
    "1": {
      "0": {
        "0": "pstr",
        "1": {
          "0": {
            "0": "string",
            "type": "tcon"
          },
          "1": {
            "type": "nil"
          },
          "type": "cons"
        },
        "type": ","
      },
      "1": {
        "0": {
          "0": "pint",
          "1": {
            "0": {
              "0": "int",
              "type": "tcon"
            },
            "1": {
              "type": "nil"
            },
            "type": "cons"
          },
          "type": ","
        },
        "1": {
          "0": {
            "0": "pbool",
            "1": {
              "0": {
                "0": "bool",
                "type": "tcon"
              },
              "1": {
                "type": "nil"
              },
              "type": "cons"
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
      "type": "cons"
    },
    "type": "sdeftype",
    "loc": 515
  },
  {
    "0": "pat",
    "1": {
      "0": {
        "0": "pany",
        "1": {
          "type": "nil"
        },
        "type": ","
      },
      "1": {
        "0": {
          "0": "pvar",
          "1": {
            "0": {
              "0": "string",
              "type": "tcon"
            },
            "1": {
              "type": "nil"
            },
            "type": "cons"
          },
          "type": ","
        },
        "1": {
          "0": {
            "0": "pcon",
            "1": {
              "0": {
                "0": "string",
                "type": "tcon"
              },
              "1": {
                "0": {
                  "0": "string",
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
            "type": "nil"
          },
          "type": "cons"
        },
        "type": "cons"
      },
      "type": "cons"
    },
    "type": "sdeftype",
    "loc": 528
  },
  {
    "0": "type",
    "1": {
      "0": {
        "0": "tvar",
        "1": {
          "0": {
            "0": "int",
            "type": "tcon"
          },
          "1": {
            "type": "nil"
          },
          "type": "cons"
        },
        "type": ","
      },
      "1": {
        "0": {
          "0": "tapp",
          "1": {
            "0": {
              "0": "type",
              "type": "tcon"
            },
            "1": {
              "0": {
                "0": "type",
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
            "0": "tcon",
            "1": {
              "0": {
                "0": "string",
                "type": "tcon"
              },
              "1": {
                "type": "nil"
              },
              "type": "cons"
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
      "type": "cons"
    },
    "type": "sdeftype",
    "loc": 543
  },
  {
    "0": "stmt",
    "1": {
      "0": {
        "0": "sdeftype",
        "1": {
          "0": {
            "0": "string",
            "type": "tcon"
          },
          "1": {
            "0": {
              "0": {
                "0": "string",
                "type": "tcon"
              },
              "1": {
                "0": "type",
                "type": "tcon"
              },
              "type": "tapp"
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
          "0": "sdef",
          "1": {
            "0": {
              "0": "string",
              "type": "tcon"
            },
            "1": {
              "0": {
                "0": "expr",
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
            "0": "sexpr",
            "1": {
              "0": {
                "0": "expr",
                "type": "tcon"
              },
              "1": {
                "type": "nil"
              },
              "type": "cons"
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
      "type": "cons"
    },
    "type": "sdeftype",
    "loc": 557
  }
]}