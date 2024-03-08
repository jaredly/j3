return {type: 'bootstrap', stmts: [
  {
    "0": "builtins",
    "1": {
      "0": {
        "0": "const sanMap = { '-': '_', '+': '$pl', '*': '$ti', '=': '$eq', \n'>': '$gt', '<': '$lt', \"'\": '$qu', '\"': '$dq', ',': '$co', '@': '$at'};\n\nconst kwds = 'case var if return';\nconst rx = [];\nkwds.split(' ').forEach((kwd) =>\n    rx.push([new RegExp(`^${kwd}$`, 'g'), '$' + kwd]),);\nconst sanitize = (raw) => {\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    rx.forEach(([rx, res]) => {\n        raw = raw.replaceAll(rx, res);\n    });\n    return raw;\n};\nconst jsonify = (raw) => JSON.stringify(raw);\n\nconst unwrapArray = (v) => {\n    if (!v) debugger\n    return v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])]\n};\nconst fatal = (e) => {throw new Error(e)}\nconst nil = { type: 'nil' };\nconst cons = (a) => (b) => ({ type: 'cons', 0: a, 1: b });\nconst $pl$pl = (items) => unwrapArray(items).join('');\nconst $pl = (a) => (b) => a + b;\nconst _ = (a) => (b) => a - b;\nconst int_to_string = (a) => a + '';\nconst replace_all = (a) => (b) => (c) => {\n    return a.replaceAll(b, c);\n};\nconst $co = (a) => (b) => ({ type: ',', 0: a, 1: b });\nconst reduce = (init) => (items) => (f) => {\n    return unwrapArray(items).reduce((a, b) => f(a)(b), init);\n};\n",
        "type": "pstr"
      },
      "type": "eprim"
    },
    "type": "sdef",
    "loc": 403
  },
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
    "loc": 3514
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
    "loc": 590
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
    "loc": 408
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
    "loc": 529
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
      "type": "cons"
    },
    "type": "sdeftype",
    "loc": 541
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
    "loc": 555
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
    "loc": 568
  },
  {
    "0": "prelude",
    "1": {
      "0": {
        "0": "# prelude",
        "type": "pstr"
      },
      "type": "eprim"
    },
    "type": "sdef",
    "loc": 3522
  },
  {
    "0": "join",
    "1": {
      "0": "sep",
      "1": {
        "0": "items",
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
                "0": {
                  "0": "",
                  "type": "pstr"
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
                    "0": "one",
                    "1": {
                      "0": "rest",
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
                    "0": "rest",
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
                        "0": "one",
                        "type": "evar"
                      },
                      "type": ","
                    },
                    "1": {
                      "0": {
                        "0": {
                          "type": "pany"
                        },
                        "1": {
                          "0": {
                            "0": "++",
                            "type": "evar"
                          },
                          "1": {
                            "0": {
                              "0": {
                                "0": "cons",
                                "type": "evar"
                              },
                              "1": {
                                "0": "one",
                                "type": "evar"
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
                                  "0": "sep",
                                  "type": "evar"
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
                                      "0": {
                                        "0": "join",
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": "sep",
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
    "type": "sdef",
    "loc": 2008
  },
  {
    "0": {
      "0": {
        "0": {
          "0": "join",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": " ",
            "type": "pstr"
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
              "0": "one",
              "type": "pstr"
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
                "0": "two",
                "type": "pstr"
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
                  "0": "three",
                  "type": "pstr"
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
      "type": "eapp"
    },
    "type": "sexpr",
    "loc": 2080
  },
  {
    "0": {
      "0": {
        "0": {
          "0": "join",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": " ",
            "type": "pstr"
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
    "type": "sexpr",
    "loc": 3555
  },
  {
    "0": {
      "0": {
        "0": {
          "0": "join",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": " ",
            "type": "pstr"
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
              "0": "one",
              "type": "pstr"
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
    "loc": 3561
  },
  {
    "0": "map",
    "1": {
      "0": "values",
      "1": {
        "0": "f",
        "1": {
          "0": {
            "0": "values",
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
                "0": "nil",
                "type": "evar"
              },
              "type": ","
            },
            "1": {
              "0": {
                "0": {
                  "0": "cons",
                  "1": {
                    "0": "one",
                    "1": {
                      "0": "rest",
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
                      "0": "cons",
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": "f",
                        "type": "evar"
                      },
                      "1": {
                        "0": "one",
                        "type": "evar"
                      },
                      "type": "eapp"
                    },
                    "type": "eapp"
                  },
                  "1": {
                    "0": {
                      "0": {
                        "0": "map",
                        "type": "evar"
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
    "type": "sdef",
    "loc": 2248
  },
  {
    "0": "mapi",
    "1": {
      "0": "i",
      "1": {
        "0": "values",
        "1": {
          "0": "f",
          "1": {
            "0": {
              "0": "values",
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
                  "0": "nil",
                  "type": "evar"
                },
                "type": ","
              },
              "1": {
                "0": {
                  "0": {
                    "0": "cons",
                    "1": {
                      "0": "one",
                      "1": {
                        "0": "rest",
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
                        "0": "cons",
                        "type": "evar"
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": "f",
                            "type": "evar"
                          },
                          "1": {
                            "0": "i",
                            "type": "evar"
                          },
                          "type": "eapp"
                        },
                        "1": {
                          "0": "one",
                          "type": "evar"
                        },
                        "type": "eapp"
                      },
                      "type": "eapp"
                    },
                    "1": {
                      "0": {
                        "0": {
                          "0": {
                            "0": "mapi",
                            "type": "evar"
                          },
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
                              "0": "i",
                              "type": "evar"
                            },
                            "type": "eapp"
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
    "loc": 2402
  },
  {
    "0": "foldl",
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
                      "0": "one",
                      "1": {
                        "0": "rest",
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
                        "0": {
                          "0": "foldl",
                          "type": "evar"
                        },
                        "1": {
                          "0": {
                            "0": {
                              "0": "f",
                              "type": "evar"
                            },
                            "1": {
                              "0": "init",
                              "type": "evar"
                            },
                            "type": "eapp"
                          },
                          "1": {
                            "0": "one",
                            "type": "evar"
                          },
                          "type": "eapp"
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
    "loc": 2312
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
                      "0": "one",
                      "1": {
                        "0": "rest",
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
    "loc": 2658
  },
  {
    "0": {
      "0": {
        "0": {
          "0": {
            "0": "foldl",
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
              "0": {
                "0": {
                  "0": "cons",
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": 3,
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
                      "0": 4,
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
          "type": "eapp"
        },
        "type": "eapp"
      },
      "1": {
        "0": ",",
        "type": "evar"
      },
      "type": "eapp"
    },
    "type": "sexpr",
    "loc": 2368
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
              "0": 5,
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
              "0": {
                "0": {
                  "0": "cons",
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": 3,
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
                      "0": 4,
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
          "type": "eapp"
        },
        "type": "eapp"
      },
      "1": {
        "0": ",",
        "type": "evar"
      },
      "type": "eapp"
    },
    "type": "sexpr",
    "loc": 2726
  },
  {
    "0": "consr",
    "1": {
      "0": "a",
      "1": {
        "0": "b",
        "1": {
          "0": {
            "0": {
              "0": "cons",
              "type": "evar"
            },
            "1": {
              "0": "b",
              "type": "evar"
            },
            "type": "eapp"
          },
          "1": {
            "0": "a",
            "type": "evar"
          },
          "type": "eapp"
        },
        "type": "elambda"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 2790
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
            "0": "nil",
            "type": "evar"
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
              "0": {
                "0": {
                  "0": "cons",
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": 3,
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
                      "0": 4,
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
          "type": "eapp"
        },
        "type": "eapp"
      },
      "1": {
        "0": "consr",
        "type": "evar"
      },
      "type": "eapp"
    },
    "type": "sexpr",
    "loc": 2746
  },
  {
    "0": "compilation",
    "1": {
      "0": {
        "0": "# compilation",
        "type": "pstr"
      },
      "type": "eprim"
    },
    "type": "sdef",
    "loc": 3537
  },
  {
    "0": "literal-constr",
    "1": {
      "0": "name",
      "1": {
        "0": "args",
        "1": {
          "0": {
            "0": "++",
            "type": "evar"
          },
          "1": {
            "0": {
              "0": {
                "0": "cons",
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": "({type: \\\"",
                  "type": "pstr"
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
                  "0": "name",
                  "type": "evar"
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
                      "0": "\"",
                      "type": "pstr"
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
                        "0": "++",
                        "type": "evar"
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": {
                              "0": "mapi",
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
                            "0": "args",
                            "type": "evar"
                          },
                          "type": "eapp"
                        },
                        "1": {
                          "0": "i",
                          "1": {
                            "0": "arg",
                            "1": {
                              "0": {
                                "0": "++",
                                "type": "evar"
                              },
                              "1": {
                                "0": {
                                  "0": {
                                    "0": "cons",
                                    "type": "evar"
                                  },
                                  "1": {
                                    "0": {
                                      "0": ", ",
                                      "type": "pstr"
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
                                        "0": "int-to-string",
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": "i",
                                        "type": "evar"
                                      },
                                      "type": "eapp"
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
                                          "0": ": ",
                                          "type": "pstr"
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
                                          "0": "arg",
                                          "type": "evar"
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
                                "type": "eapp"
                              },
                              "type": "eapp"
                            },
                            "type": "elambda"
                          },
                          "type": "elambda"
                        },
                        "type": "eapp"
                      },
                      "type": "eapp"
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
                          "0": "})",
                          "type": "pstr"
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
              "type": "eapp"
            },
            "type": "eapp"
          },
          "type": "eapp"
        },
        "type": "elambda"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 3118
  },
  {
    "0": {
      "0": {
        "0": {
          "0": "literal-constr",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": "cons",
            "type": "pstr"
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
              "0": "0",
              "type": "pstr"
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
    "loc": 3200
  },
  {
    "0": "compile-st",
    "1": {
      "0": "stmt",
      "1": {
        "0": {
          "0": "stmt",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": {
              "0": "sexpr",
              "1": {
                "0": "expr",
                "1": {
                  "type": "nil"
                },
                "type": "cons"
              },
              "type": "pcon"
            },
            "1": {
              "0": {
                "0": "compile",
                "type": "evar"
              },
              "1": {
                "0": "expr",
                "type": "evar"
              },
              "type": "eapp"
            },
            "type": ","
          },
          "1": {
            "0": {
              "0": {
                "0": "sdef",
                "1": {
                  "0": "name",
                  "1": {
                    "0": "body",
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
                  "0": "++",
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": {
                      "0": "cons",
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": "const ",
                        "type": "pstr"
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
                          "0": "sanitize",
                          "type": "evar"
                        },
                        "1": {
                          "0": "name",
                          "type": "evar"
                        },
                        "type": "eapp"
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
                            "0": " = ",
                            "type": "pstr"
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
                              "0": "compile",
                              "type": "evar"
                            },
                            "1": {
                              "0": "body",
                              "type": "evar"
                            },
                            "type": "eapp"
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
                                "0": ";\\n",
                                "type": "pstr"
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
                    "type": "eapp"
                  },
                  "type": "eapp"
                },
                "type": "eapp"
              },
              "type": ","
            },
            "1": {
              "0": {
                "0": {
                  "0": "sdeftype",
                  "1": {
                    "0": "name",
                    "1": {
                      "0": "cases",
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
                      "0": "join",
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": "\\n",
                        "type": "pstr"
                      },
                      "type": "eprim"
                    },
                    "type": "eapp"
                  },
                  "1": {
                    "0": {
                      "0": {
                        "0": "map",
                        "type": "evar"
                      },
                      "1": {
                        "0": "cases",
                        "type": "evar"
                      },
                      "type": "eapp"
                    },
                    "1": {
                      "0": "case",
                      "1": {
                        "0": {
                          "0": "case",
                          "type": "evar"
                        },
                        "1": {
                          "0": {
                            "0": {
                              "0": ",",
                              "1": {
                                "0": "name2",
                                "1": {
                                  "0": "args",
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
                                "0": "++",
                                "type": "evar"
                              },
                              "1": {
                                "0": {
                                  "0": {
                                    "0": "cons",
                                    "type": "evar"
                                  },
                                  "1": {
                                    "0": {
                                      "0": "const ",
                                      "type": "pstr"
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
                                      "0": "name2",
                                      "type": "evar"
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
                                          "0": " = ",
                                          "type": "pstr"
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
                                            "0": "++",
                                            "type": "evar"
                                          },
                                          "1": {
                                            "0": {
                                              "0": {
                                                "0": {
                                                  "0": "mapi",
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
                                                "0": "args",
                                                "type": "evar"
                                              },
                                              "type": "eapp"
                                            },
                                            "1": {
                                              "0": "i",
                                              "1": {
                                                "0": "_",
                                                "1": {
                                                  "0": {
                                                    "0": "++",
                                                    "type": "evar"
                                                  },
                                                  "1": {
                                                    "0": {
                                                      "0": {
                                                        "0": "cons",
                                                        "type": "evar"
                                                      },
                                                      "1": {
                                                        "0": {
                                                          "0": "(v",
                                                          "type": "pstr"
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
                                                            "0": "int-to-string",
                                                            "type": "evar"
                                                          },
                                                          "1": {
                                                            "0": "i",
                                                            "type": "evar"
                                                          },
                                                          "type": "eapp"
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
                                                              "0": ") => ",
                                                              "type": "pstr"
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
                                                  "type": "eapp"
                                                },
                                                "type": "elambda"
                                              },
                                              "type": "elambda"
                                            },
                                            "type": "eapp"
                                          },
                                          "type": "eapp"
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
                                              "0": "({type: \\\"",
                                              "type": "pstr"
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
                                              "0": "name2",
                                              "type": "evar"
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
                                                  "0": "\\\"",
                                                  "type": "pstr"
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
                                                    "0": "++",
                                                    "type": "evar"
                                                  },
                                                  "1": {
                                                    "0": {
                                                      "0": {
                                                        "0": {
                                                          "0": "mapi",
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
                                                        "0": "args",
                                                        "type": "evar"
                                                      },
                                                      "type": "eapp"
                                                    },
                                                    "1": {
                                                      "0": "i",
                                                      "1": {
                                                        "0": "_",
                                                        "1": {
                                                          "0": {
                                                            "0": "++",
                                                            "type": "evar"
                                                          },
                                                          "1": {
                                                            "0": {
                                                              "0": {
                                                                "0": "cons",
                                                                "type": "evar"
                                                              },
                                                              "1": {
                                                                "0": {
                                                                  "0": ", ",
                                                                  "type": "pstr"
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
                                                                    "0": "int-to-string",
                                                                    "type": "evar"
                                                                  },
                                                                  "1": {
                                                                    "0": "i",
                                                                    "type": "evar"
                                                                  },
                                                                  "type": "eapp"
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
                                                                      "0": ": v",
                                                                      "type": "pstr"
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
                                                                        "0": "int-to-string",
                                                                        "type": "evar"
                                                                      },
                                                                      "1": {
                                                                        "0": "i",
                                                                        "type": "evar"
                                                                      },
                                                                      "type": "eapp"
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
                                                            "type": "eapp"
                                                          },
                                                          "type": "eapp"
                                                        },
                                                        "type": "elambda"
                                                      },
                                                      "type": "elambda"
                                                    },
                                                    "type": "eapp"
                                                  },
                                                  "type": "eapp"
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
                                                      "0": "});",
                                                      "type": "pstr"
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
                                          "type": "eapp"
                                        },
                                        "type": "eapp"
                                      },
                                      "type": "eapp"
                                    },
                                    "type": "eapp"
                                  },
                                  "type": "eapp"
                                },
                                "type": "eapp"
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
                        "type": "ematch"
                      },
                      "type": "elambda"
                    },
                    "type": "eapp"
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
          "type": "cons"
        },
        "type": "ematch"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 638
  },
  {
    "0": "util",
    "1": {
      "0": {
        "0": "# util",
        "type": "pstr"
      },
      "type": "eprim"
    },
    "type": "sdef",
    "loc": 3539
  },
  {
    "0": "snd",
    "1": {
      "0": "tuple",
      "1": {
        "0": {
          "0": "tuple",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": {
              "0": ",",
              "1": {
                "0": "_",
                "1": {
                  "0": "v",
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
              "0": "v",
              "type": "evar"
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
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 772
  },
  {
    "0": "fst",
    "1": {
      "0": "tuple",
      "1": {
        "0": {
          "0": "tuple",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": {
              "0": ",",
              "1": {
                "0": "v",
                "1": {
                  "0": "_",
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
              "0": "v",
              "type": "evar"
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
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 813
  },
  {
    "0": "replaces",
    "1": {
      "0": "target",
      "1": {
        "0": "repl",
        "1": {
          "0": {
            "0": "repl",
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
                "0": "target",
                "type": "evar"
              },
              "type": ","
            },
            "1": {
              "0": {
                "0": {
                  "0": "cons",
                  "1": {
                    "0": "one",
                    "1": {
                      "0": "rest",
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
                    "0": "one",
                    "type": "evar"
                  },
                  "1": {
                    "0": {
                      "0": {
                        "0": ",",
                        "1": {
                          "0": "find",
                          "1": {
                            "0": "nw",
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
                            "0": "replaces",
                            "type": "evar"
                          },
                          "1": {
                            "0": {
                              "0": {
                                "0": {
                                  "0": "replace-all",
                                  "type": "evar"
                                },
                                "1": {
                                  "0": "target",
                                  "type": "evar"
                                },
                                "type": "eapp"
                              },
                              "1": {
                                "0": "find",
                                "type": "evar"
                              },
                              "type": "eapp"
                            },
                            "1": {
                              "0": "nw",
                              "type": "evar"
                            },
                            "type": "eapp"
                          },
                          "type": "eapp"
                        },
                        "1": {
                          "0": "rest",
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
                  "type": "ematch"
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
    "type": "sdef",
    "loc": 2864
  },
  {
    "0": {
      "0": {
        "0": {
          "0": "replaces",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": "\\n",
            "type": "pstr"
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
              "0": {
                "0": ",",
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": "\\\\",
                  "type": "pstr"
                },
                "type": "eprim"
              },
              "type": "eapp"
            },
            "1": {
              "0": {
                "0": "\\\\\\\\",
                "type": "pstr"
              },
              "type": "eprim"
            },
            "type": "eapp"
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
                "0": {
                  "0": ",",
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": "\\n",
                    "type": "pstr"
                  },
                  "type": "eprim"
                },
                "type": "eapp"
              },
              "1": {
                "0": {
                  "0": "\\\\n",
                  "type": "pstr"
                },
                "type": "eprim"
              },
              "type": "eapp"
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
    "type": "sexpr",
    "loc": 2930
  },
  {
    "0": "escape-string",
    "1": {
      "0": "string",
      "1": {
        "0": {
          "0": {
            "0": "replaces",
            "type": "evar"
          },
          "1": {
            "0": "string",
            "type": "evar"
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
                "0": {
                  "0": ",",
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": "\\\\",
                    "type": "pstr"
                  },
                  "type": "eprim"
                },
                "type": "eapp"
              },
              "1": {
                "0": {
                  "0": "\\\\\\\\",
                  "type": "pstr"
                },
                "type": "eprim"
              },
              "type": "eapp"
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
                  "0": {
                    "0": ",",
                    "type": "evar"
                  },
                  "1": {
                    "0": {
                      "0": "\\n",
                      "type": "pstr"
                    },
                    "type": "eprim"
                  },
                  "type": "eapp"
                },
                "1": {
                  "0": {
                    "0": "\\\\n",
                    "type": "pstr"
                  },
                  "type": "eprim"
                },
                "type": "eapp"
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
                    "0": {
                      "0": ",",
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": "\\\"",
                        "type": "pstr"
                      },
                      "type": "eprim"
                    },
                    "type": "eapp"
                  },
                  "1": {
                    "0": {
                      "0": "\\\\\"",
                      "type": "pstr"
                    },
                    "type": "eprim"
                  },
                  "type": "eapp"
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
        "type": "eapp"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 3306
  },
  {
    "0": "unescape-string",
    "1": {
      "0": "string",
      "1": {
        "0": {
          "0": {
            "0": "replaces",
            "type": "evar"
          },
          "1": {
            "0": "string",
            "type": "evar"
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
                "0": {
                  "0": ",",
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": "\\\\\"",
                    "type": "pstr"
                  },
                  "type": "eprim"
                },
                "type": "eapp"
              },
              "1": {
                "0": {
                  "0": "\\\"",
                  "type": "pstr"
                },
                "type": "eprim"
              },
              "type": "eapp"
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
                  "0": {
                    "0": ",",
                    "type": "evar"
                  },
                  "1": {
                    "0": {
                      "0": "\\\\n",
                      "type": "pstr"
                    },
                    "type": "eprim"
                  },
                  "type": "eapp"
                },
                "1": {
                  "0": {
                    "0": "\\n",
                    "type": "pstr"
                  },
                  "type": "eprim"
                },
                "type": "eapp"
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
                    "0": {
                      "0": ",",
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": "\\\\\\\\",
                        "type": "pstr"
                      },
                      "type": "eprim"
                    },
                    "type": "eapp"
                  },
                  "1": {
                    "0": {
                      "0": "\\\\",
                      "type": "pstr"
                    },
                    "type": "eprim"
                  },
                  "type": "eapp"
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
        "type": "eapp"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 3358
  },
  {
    "0": "quot",
    "1": {
      "0": "expr",
      "1": {
        "0": {
          "0": "expr",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": {
              "0": "eprim",
              "1": {
                "0": "prim",
                "1": {
                  "type": "nil"
                },
                "type": "cons"
              },
              "type": "pcon"
            },
            "1": {
              "0": {
                "0": "prim",
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": {
                    "0": "pstr",
                    "1": {
                      "0": "string",
                      "1": {
                        "type": "nil"
                      },
                      "type": "cons"
                    },
                    "type": "pcon"
                  },
                  "1": {
                    "0": {
                      "0": "++",
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": {
                          "0": "cons",
                          "type": "evar"
                        },
                        "1": {
                          "0": {
                            "0": "{type: ",
                            "type": "pstr"
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
                  "type": ","
                },
                "1": {
                  "type": "nil"
                },
                "type": "cons"
              },
              "type": "ematch"
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
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 3072
  },
  {
    "0": "compile",
    "1": {
      "0": "expr",
      "1": {
        "0": {
          "0": "expr",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": {
              "0": "eprim",
              "1": {
                "0": "prim",
                "1": {
                  "type": "nil"
                },
                "type": "cons"
              },
              "type": "pcon"
            },
            "1": {
              "0": {
                "0": "prim",
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": {
                    "0": "pstr",
                    "1": {
                      "0": "string",
                      "1": {
                        "type": "nil"
                      },
                      "type": "cons"
                    },
                    "type": "pcon"
                  },
                  "1": {
                    "0": {
                      "0": "++",
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": {
                          "0": "cons",
                          "type": "evar"
                        },
                        "1": {
                          "0": {
                            "0": "\\\"",
                            "type": "pstr"
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
                              "0": "escape-string",
                              "type": "evar"
                            },
                            "1": {
                              "0": {
                                "0": "unescape-string",
                                "type": "evar"
                              },
                              "1": {
                                "0": "string",
                                "type": "evar"
                              },
                              "type": "eapp"
                            },
                            "type": "eapp"
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
                                "0": "\\\"",
                                "type": "pstr"
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
                    "type": "eapp"
                  },
                  "type": ","
                },
                "1": {
                  "0": {
                    "0": {
                      "0": "pint",
                      "1": {
                        "0": "int",
                        "1": {
                          "type": "nil"
                        },
                        "type": "cons"
                      },
                      "type": "pcon"
                    },
                    "1": {
                      "0": {
                        "0": "int-to-string",
                        "type": "evar"
                      },
                      "1": {
                        "0": "int",
                        "type": "evar"
                      },
                      "type": "eapp"
                    },
                    "type": ","
                  },
                  "1": {
                    "0": {
                      "0": {
                        "0": "pbool",
                        "1": {
                          "0": "bool",
                          "1": {
                            "type": "nil"
                          },
                          "type": "cons"
                        },
                        "type": "pcon"
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": {
                              "0": "if",
                              "type": "evar"
                            },
                            "1": {
                              "0": "bool",
                              "type": "evar"
                            },
                            "type": "eapp"
                          },
                          "1": {
                            "0": {
                              "0": "true",
                              "type": "pstr"
                            },
                            "type": "eprim"
                          },
                          "type": "eapp"
                        },
                        "1": {
                          "0": {
                            "0": "false",
                            "type": "pstr"
                          },
                          "type": "eprim"
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
                "type": "cons"
              },
              "type": "ematch"
            },
            "type": ","
          },
          "1": {
            "0": {
              "0": {
                "0": "evar",
                "1": {
                  "0": "name",
                  "1": {
                    "type": "nil"
                  },
                  "type": "cons"
                },
                "type": "pcon"
              },
              "1": {
                "0": {
                  "0": "sanitize",
                  "type": "evar"
                },
                "1": {
                  "0": "name",
                  "type": "evar"
                },
                "type": "eapp"
              },
              "type": ","
            },
            "1": {
              "0": {
                "0": {
                  "0": "equot",
                  "1": {
                    "0": "inner",
                    "1": {
                      "type": "nil"
                    },
                    "type": "cons"
                  },
                  "type": "pcon"
                },
                "1": {
                  "0": {
                    "0": "jsonify",
                    "type": "evar"
                  },
                  "1": {
                    "0": "inner",
                    "type": "evar"
                  },
                  "type": "eapp"
                },
                "type": ","
              },
              "1": {
                "0": {
                  "0": {
                    "0": "elambda",
                    "1": {
                      "0": "name",
                      "1": {
                        "0": "body",
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
                      "0": "++",
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": {
                          "0": "cons",
                          "type": "evar"
                        },
                        "1": {
                          "0": {
                            "0": "(",
                            "type": "pstr"
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
                              "0": "sanitize",
                              "type": "evar"
                            },
                            "1": {
                              "0": "name",
                              "type": "evar"
                            },
                            "type": "eapp"
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
                                "0": ") => ",
                                "type": "pstr"
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
                                  "0": "compile",
                                  "type": "evar"
                                },
                                "1": {
                                  "0": "body",
                                  "type": "evar"
                                },
                                "type": "eapp"
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
                      "type": "eapp"
                    },
                    "type": "eapp"
                  },
                  "type": ","
                },
                "1": {
                  "0": {
                    "0": {
                      "0": "elet",
                      "1": {
                        "0": "name",
                        "1": {
                          "0": "init",
                          "1": {
                            "0": "body",
                            "1": {
                              "type": "nil"
                            },
                            "type": "cons"
                          },
                          "type": "cons"
                        },
                        "type": "cons"
                      },
                      "type": "pcon"
                    },
                    "1": {
                      "0": {
                        "0": "++",
                        "type": "evar"
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": "cons",
                            "type": "evar"
                          },
                          "1": {
                            "0": {
                              "0": "((",
                              "type": "pstr"
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
                                "0": "sanitize",
                                "type": "evar"
                              },
                              "1": {
                                "0": "name",
                                "type": "evar"
                              },
                              "type": "eapp"
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
                                  "0": ") => ",
                                  "type": "pstr"
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
                                    "0": "compile",
                                    "type": "evar"
                                  },
                                  "1": {
                                    "0": "body",
                                    "type": "evar"
                                  },
                                  "type": "eapp"
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
                                      "0": ")(",
                                      "type": "pstr"
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
                                        "0": "compile",
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": "init",
                                        "type": "evar"
                                      },
                                      "type": "eapp"
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
                                          "0": ")",
                                          "type": "pstr"
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
                              "type": "eapp"
                            },
                            "type": "eapp"
                          },
                          "type": "eapp"
                        },
                        "type": "eapp"
                      },
                      "type": "eapp"
                    },
                    "type": ","
                  },
                  "1": {
                    "0": {
                      "0": {
                        "0": "eapp",
                        "1": {
                          "0": "fn",
                          "1": {
                            "0": "arg",
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
                          "0": "fn",
                          "type": "evar"
                        },
                        "1": {
                          "0": {
                            "0": {
                              "0": "elambda",
                              "1": {
                                "0": "name",
                                "1": {
                                  "type": "nil"
                                },
                                "type": "cons"
                              },
                              "type": "pcon"
                            },
                            "1": {
                              "0": {
                                "0": "++",
                                "type": "evar"
                              },
                              "1": {
                                "0": {
                                  "0": {
                                    "0": "cons",
                                    "type": "evar"
                                  },
                                  "1": {
                                    "0": {
                                      "0": "(",
                                      "type": "pstr"
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
                                        "0": "compile",
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": "fn",
                                        "type": "evar"
                                      },
                                      "type": "eapp"
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
                                          "0": ")(",
                                          "type": "pstr"
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
                                            "0": "compile",
                                            "type": "evar"
                                          },
                                          "1": {
                                            "0": "arg",
                                            "type": "evar"
                                          },
                                          "type": "eapp"
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
                                              "0": ")",
                                              "type": "pstr"
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
                                  "type": "eapp"
                                },
                                "type": "eapp"
                              },
                              "type": "eapp"
                            },
                            "type": ","
                          },
                          "1": {
                            "0": {
                              "0": {
                                "type": "pany"
                              },
                              "1": {
                                "0": {
                                  "0": "++",
                                  "type": "evar"
                                },
                                "1": {
                                  "0": {
                                    "0": {
                                      "0": "cons",
                                      "type": "evar"
                                    },
                                    "1": {
                                      "0": {
                                        "0": "compile",
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": "fn",
                                        "type": "evar"
                                      },
                                      "type": "eapp"
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
                                          "0": "(",
                                          "type": "pstr"
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
                                            "0": "compile",
                                            "type": "evar"
                                          },
                                          "1": {
                                            "0": "arg",
                                            "type": "evar"
                                          },
                                          "type": "eapp"
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
                                              "0": ")",
                                              "type": "pstr"
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
                                  "type": "eapp"
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
                      "type": ","
                    },
                    "1": {
                      "0": {
                        "0": {
                          "0": "ematch",
                          "1": {
                            "0": "target",
                            "1": {
                              "0": "cases",
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
                            "0": "++",
                            "type": "evar"
                          },
                          "1": {
                            "0": {
                              "0": {
                                "0": "cons",
                                "type": "evar"
                              },
                              "1": {
                                "0": {
                                  "0": "(($target) => ",
                                  "type": "pstr"
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
                                    "0": {
                                      "0": {
                                        "0": "foldr",
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": {
                                          "0": "fatal('ran out of cases: ' + JSON.stringify($target))",
                                          "type": "pstr"
                                        },
                                        "type": "eprim"
                                      },
                                      "type": "eapp"
                                    },
                                    "1": {
                                      "0": "cases",
                                      "type": "evar"
                                    },
                                    "type": "eapp"
                                  },
                                  "1": {
                                    "0": "otherwise",
                                    "1": {
                                      "0": "case",
                                      "1": {
                                        "0": {
                                          "0": "case",
                                          "type": "evar"
                                        },
                                        "1": {
                                          "0": {
                                            "0": {
                                              "0": ",",
                                              "1": {
                                                "0": "pat",
                                                "1": {
                                                  "0": "body",
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
                                                "0": "pat",
                                                "type": "evar"
                                              },
                                              "1": {
                                                "0": {
                                                  "0": {
                                                    "0": "pany",
                                                    "1": {
                                                      "type": "nil"
                                                    },
                                                    "type": "pcon"
                                                  },
                                                  "1": {
                                                    "0": {
                                                      "0": "++",
                                                      "type": "evar"
                                                    },
                                                    "1": {
                                                      "0": {
                                                        "0": {
                                                          "0": "cons",
                                                          "type": "evar"
                                                        },
                                                        "1": {
                                                          "0": {
                                                            "0": "true ? ",
                                                            "type": "pstr"
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
                                                              "0": "compile",
                                                              "type": "evar"
                                                            },
                                                            "1": {
                                                              "0": "body",
                                                              "type": "evar"
                                                            },
                                                            "type": "eapp"
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
                                                                "0": " : ",
                                                                "type": "pstr"
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
                                                                "0": "otherwise",
                                                                "type": "evar"
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
                                                      "type": "eapp"
                                                    },
                                                    "type": "eapp"
                                                  },
                                                  "type": ","
                                                },
                                                "1": {
                                                  "0": {
                                                    "0": {
                                                      "0": "pint",
                                                      "1": {
                                                        "0": "int",
                                                        "1": {
                                                          "type": "nil"
                                                        },
                                                        "type": "cons"
                                                      },
                                                      "type": "pcon"
                                                    },
                                                    "1": {
                                                      "0": {
                                                        "0": "++",
                                                        "type": "evar"
                                                      },
                                                      "1": {
                                                        "0": {
                                                          "0": {
                                                            "0": "cons",
                                                            "type": "evar"
                                                          },
                                                          "1": {
                                                            "0": {
                                                              "0": "$target === ",
                                                              "type": "pstr"
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
                                                                "0": "int-to-string",
                                                                "type": "evar"
                                                              },
                                                              "1": {
                                                                "0": "int",
                                                                "type": "evar"
                                                              },
                                                              "type": "eapp"
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
                                                                  "0": " ? ",
                                                                  "type": "pstr"
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
                                                                    "0": "compile",
                                                                    "type": "evar"
                                                                  },
                                                                  "1": {
                                                                    "0": "body",
                                                                    "type": "evar"
                                                                  },
                                                                  "type": "eapp"
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
                                                                      "0": " : ",
                                                                      "type": "pstr"
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
                                                                      "0": "otherwise",
                                                                      "type": "evar"
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
                                                            "type": "eapp"
                                                          },
                                                          "type": "eapp"
                                                        },
                                                        "type": "eapp"
                                                      },
                                                      "type": "eapp"
                                                    },
                                                    "type": ","
                                                  },
                                                  "1": {
                                                    "0": {
                                                      "0": {
                                                        "0": "pvar",
                                                        "1": {
                                                          "0": "name",
                                                          "1": {
                                                            "type": "nil"
                                                          },
                                                          "type": "cons"
                                                        },
                                                        "type": "pcon"
                                                      },
                                                      "1": {
                                                        "0": {
                                                          "0": "++",
                                                          "type": "evar"
                                                        },
                                                        "1": {
                                                          "0": {
                                                            "0": {
                                                              "0": "cons",
                                                              "type": "evar"
                                                            },
                                                            "1": {
                                                              "0": {
                                                                "0": "true ? ((",
                                                                "type": "pstr"
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
                                                                  "0": "sanitize",
                                                                  "type": "evar"
                                                                },
                                                                "1": {
                                                                  "0": "name",
                                                                  "type": "evar"
                                                                },
                                                                "type": "eapp"
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
                                                                    "0": ") => ",
                                                                    "type": "pstr"
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
                                                                      "0": "compile",
                                                                      "type": "evar"
                                                                    },
                                                                    "1": {
                                                                      "0": "body",
                                                                      "type": "evar"
                                                                    },
                                                                    "type": "eapp"
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
                                                                        "0": ")($target)",
                                                                        "type": "pstr"
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
                                                            "type": "eapp"
                                                          },
                                                          "type": "eapp"
                                                        },
                                                        "type": "eapp"
                                                      },
                                                      "type": ","
                                                    },
                                                    "1": {
                                                      "0": {
                                                        "0": {
                                                          "0": "pcon",
                                                          "1": {
                                                            "0": "name",
                                                            "1": {
                                                              "0": "args",
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
                                                            "0": "++",
                                                            "type": "evar"
                                                          },
                                                          "1": {
                                                            "0": {
                                                              "0": {
                                                                "0": "cons",
                                                                "type": "evar"
                                                              },
                                                              "1": {
                                                                "0": {
                                                                  "0": "$target.type == \\\"",
                                                                  "type": "pstr"
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
                                                                  "0": "name",
                                                                  "type": "evar"
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
                                                                      "0": "\\\" ? ",
                                                                      "type": "pstr"
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
                                                                        "0": "snd",
                                                                        "type": "evar"
                                                                      },
                                                                      "1": {
                                                                        "0": {
                                                                          "0": {
                                                                            "0": {
                                                                              "0": "reduce",
                                                                              "type": "evar"
                                                                            },
                                                                            "1": {
                                                                              "0": {
                                                                                "0": {
                                                                                  "0": ",",
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
                                                                                  "0": "compile",
                                                                                  "type": "evar"
                                                                                },
                                                                                "1": {
                                                                                  "0": "body",
                                                                                  "type": "evar"
                                                                                },
                                                                                "type": "eapp"
                                                                              },
                                                                              "type": "eapp"
                                                                            },
                                                                            "type": "eapp"
                                                                          },
                                                                          "1": {
                                                                            "0": "args",
                                                                            "type": "evar"
                                                                          },
                                                                          "type": "eapp"
                                                                        },
                                                                        "1": {
                                                                          "0": "inner",
                                                                          "1": {
                                                                            "0": "name",
                                                                            "1": {
                                                                              "0": {
                                                                                "0": "inner",
                                                                                "type": "evar"
                                                                              },
                                                                              "1": {
                                                                                "0": {
                                                                                  "0": {
                                                                                    "0": ",",
                                                                                    "1": {
                                                                                      "0": "i",
                                                                                      "1": {
                                                                                        "0": "inner",
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
                                                                                        "0": ",",
                                                                                        "type": "evar"
                                                                                      },
                                                                                      "1": {
                                                                                        "0": {
                                                                                          "0": {
                                                                                            "0": "+",
                                                                                            "type": "evar"
                                                                                          },
                                                                                          "1": {
                                                                                            "0": "i",
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
                                                                                    "1": {
                                                                                      "0": {
                                                                                        "0": "++",
                                                                                        "type": "evar"
                                                                                      },
                                                                                      "1": {
                                                                                        "0": {
                                                                                          "0": {
                                                                                            "0": "cons",
                                                                                            "type": "evar"
                                                                                          },
                                                                                          "1": {
                                                                                            "0": {
                                                                                              "0": "((",
                                                                                              "type": "pstr"
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
                                                                                                "0": "sanitize",
                                                                                                "type": "evar"
                                                                                              },
                                                                                              "1": {
                                                                                                "0": "name",
                                                                                                "type": "evar"
                                                                                              },
                                                                                              "type": "eapp"
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
                                                                                                  "0": ") => ",
                                                                                                  "type": "pstr"
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
                                                                                                  "0": "inner",
                                                                                                  "type": "evar"
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
                                                                                                      "0": ")($target[",
                                                                                                      "type": "pstr"
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
                                                                                                        "0": "int-to-string",
                                                                                                        "type": "evar"
                                                                                                      },
                                                                                                      "1": {
                                                                                                        "0": "i",
                                                                                                        "type": "evar"
                                                                                                      },
                                                                                                      "type": "eapp"
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
                                                                                                          "0": "])",
                                                                                                          "type": "pstr"
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
                                                                                              "type": "eapp"
                                                                                            },
                                                                                            "type": "eapp"
                                                                                          },
                                                                                          "type": "eapp"
                                                                                        },
                                                                                        "type": "eapp"
                                                                                      },
                                                                                      "type": "eapp"
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
                                                                              "type": "ematch"
                                                                            },
                                                                            "type": "elambda"
                                                                          },
                                                                          "type": "elambda"
                                                                        },
                                                                        "type": "eapp"
                                                                      },
                                                                      "type": "eapp"
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
                                                                          "0": " : ",
                                                                          "type": "pstr"
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
                                                                          "0": "otherwise",
                                                                          "type": "evar"
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
                                                                "type": "eapp"
                                                              },
                                                              "type": "eapp"
                                                            },
                                                            "type": "eapp"
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
                                                  "type": "cons"
                                                },
                                                "type": "cons"
                                              },
                                              "type": "ematch"
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
                                      "type": "elambda"
                                    },
                                    "type": "elambda"
                                  },
                                  "type": "eapp"
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
                                      "0": ")(",
                                      "type": "pstr"
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
                                        "0": "compile",
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": "target",
                                        "type": "evar"
                                      },
                                      "type": "eapp"
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
                                          "0": ")",
                                          "type": "pstr"
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
                              "type": "eapp"
                            },
                            "type": "eapp"
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
        "type": "ematch"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 828
  },
  {
    "0": "run",
    "1": {
      "0": "v",
      "1": {
        "0": {
          "0": "eval",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": "compile",
            "type": "evar"
          },
          "1": {
            "0": "v",
            "type": "evar"
          },
          "type": "eapp"
        },
        "type": "eapp"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 3658
  },
  {
    "0": {
      "0": {
        "0": {
          "0": ",",
          "type": "evar"
        },
        "1": {
          "0": "run",
          "type": "evar"
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
              "0": {
                "0": ",",
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": {
                    "0": 1,
                    "type": "pint"
                  },
                  "type": "eprim"
                },
                "type": "equot"
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
        "1": {
          "0": {
            "0": {
              "0": "cons",
              "type": "evar"
            },
            "1": {
              "0": {
                "0": {
                  "0": ",",
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": {
                      "0": "hello",
                      "type": "pstr"
                    },
                    "type": "eprim"
                  },
                  "type": "equot"
                },
                "type": "eapp"
              },
              "1": {
                "0": {
                  "0": "hello",
                  "type": "pstr"
                },
                "type": "eprim"
              },
              "type": "eapp"
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
                  "0": {
                    "0": ",",
                    "type": "evar"
                  },
                  "1": {
                    "0": {
                      "0": {
                        "0": {
                          "0": "+",
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
                        "0": {
                          "0": 3,
                          "type": "pint"
                        },
                        "type": "eprim"
                      },
                      "type": "eapp"
                    },
                    "type": "equot"
                  },
                  "type": "eapp"
                },
                "1": {
                  "0": {
                    "0": 5,
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
                "0": {
                  "0": "cons",
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": {
                      "0": ",",
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": {
                          "0": "pany",
                          "type": "evar"
                        },
                        "1": {
                          "0": {
                            "0": {
                              "0": "pany",
                              "1": {
                                "type": "nil"
                              },
                              "type": "pcon"
                            },
                            "1": {
                              "0": {
                                "0": "any",
                                "type": "pstr"
                              },
                              "type": "eprim"
                            },
                            "type": ","
                          },
                          "1": {
                            "0": {
                              "0": {
                                "0": "pvar",
                                "1": {
                                  "0": "name",
                                  "1": {
                                    "type": "nil"
                                  },
                                  "type": "cons"
                                },
                                "type": "pcon"
                              },
                              "1": {
                                "0": "name",
                                "type": "evar"
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
                      "type": "equot"
                    },
                    "type": "eapp"
                  },
                  "1": {
                    "0": {
                      "0": "any",
                      "type": "pstr"
                    },
                    "type": "eprim"
                  },
                  "type": "eapp"
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
                      "0": {
                        "0": ",",
                        "type": "evar"
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": "a",
                            "1": {
                              "0": {
                                "0": {
                                  "0": "+",
                                  "type": "evar"
                                },
                                "1": {
                                  "0": "a",
                                  "type": "evar"
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
                          "1": {
                            "0": {
                              "0": 21,
                              "type": "pint"
                            },
                            "type": "eprim"
                          },
                          "type": "eapp"
                        },
                        "type": "equot"
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
                        "0": {
                          "0": ",",
                          "type": "evar"
                        },
                        "1": {
                          "0": {
                            "0": "one",
                            "1": {
                              "0": {
                                "0": 1,
                                "type": "pint"
                              },
                              "type": "eprim"
                            },
                            "2": {
                              "0": "two",
                              "1": {
                                "0": {
                                  "0": 2,
                                  "type": "pint"
                                },
                                "type": "eprim"
                              },
                              "2": {
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
                                  "0": {
                                    "0": 2,
                                    "type": "pint"
                                  },
                                  "type": "eprim"
                                },
                                "type": "eapp"
                              },
                              "type": "elet"
                            },
                            "type": "elet"
                          },
                          "type": "equot"
                        },
                        "type": "eapp"
                      },
                      "1": {
                        "0": {
                          "0": 3,
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
                      "0": {
                        "0": "cons",
                        "type": "evar"
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": ",",
                            "type": "evar"
                          },
                          "1": {
                            "0": {
                              "0": {
                                "0": {
                                  "0": 2,
                                  "type": "pint"
                                },
                                "type": "eprim"
                              },
                              "1": {
                                "0": {
                                  "0": {
                                    "0": 2,
                                    "type": "pint"
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
                            "type": "equot"
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
              "type": "eapp"
            },
            "type": "eapp"
          },
          "type": "eapp"
        },
        "type": "eapp"
      },
      "type": "eapp"
    },
    "type": "sexpr",
    "loc": 3569
  },
  {
    "0": {
      "0": {
        "0": "eval",
        "type": "evar"
      },
      "1": {
        "0": {
          "0": "compile",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": {
              "0": {
                "0": "+",
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
              "0": {
                "0": 3,
                "type": "pint"
              },
              "type": "eprim"
            },
            "type": "eapp"
          },
          "type": "equot"
        },
        "type": "eapp"
      },
      "type": "eapp"
    },
    "type": "sexpr",
    "loc": 3631
  },
  {
    "0": "type-check",
    "1": {
      "0": {
        "0": "# Type Check",
        "type": "pstr"
      },
      "type": "eprim"
    },
    "type": "sdef",
    "loc": 3650
  },
  {
    "0": "tfn",
    "1": {
      "0": "arg",
      "1": {
        "0": "body",
        "1": {
          "0": {
            "0": {
              "0": "tapp",
              "type": "evar"
            },
            "1": {
              "0": {
                "0": {
                  "0": "tapp",
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": "tcon",
                    "type": "evar"
                  },
                  "1": {
                    "0": {
                      "0": "->",
                      "type": "pstr"
                    },
                    "type": "eprim"
                  },
                  "type": "eapp"
                },
                "type": "eapp"
              },
              "1": {
                "0": "arg",
                "type": "evar"
              },
              "type": "eapp"
            },
            "type": "eapp"
          },
          "1": {
            "0": "body",
            "type": "evar"
          },
          "type": "eapp"
        },
        "type": "elambda"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 3709
  },
  {
    "0": "empty-subst",
    "1": {
      "0": "nil",
      "type": "evar"
    },
    "type": "sdef",
    "loc": 3730
  },
  {
    "0": "var-set",
    "1": {
      "0": "env",
      "1": {
        "0": "name",
        "1": {
          "0": "value",
          "1": {
            "0": {
              "0": {
                "0": ",",
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": {
                    "0": {
                      "0": "map-set",
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": "fst",
                        "type": "evar"
                      },
                      "1": {
                        "0": "env",
                        "type": "evar"
                      },
                      "type": "eapp"
                    },
                    "type": "eapp"
                  },
                  "1": {
                    "0": "name",
                    "type": "evar"
                  },
                  "type": "eapp"
                },
                "1": {
                  "0": "value",
                  "type": "evar"
                },
                "type": "eapp"
              },
              "type": "eapp"
            },
            "1": {
              "0": {
                "0": "snd",
                "type": "evar"
              },
              "1": {
                "0": "env",
                "type": "evar"
              },
              "type": "eapp"
            },
            "type": "eapp"
          },
          "type": "elambda"
        },
        "type": "elambda"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 3738
  },
  {
    "0": "var-get",
    "1": {
      "0": "env",
      "1": {
        "0": "name",
        "1": {
          "0": {
            "0": {
              "0": "map-get",
              "type": "evar"
            },
            "1": {
              "0": {
                "0": "fst",
                "type": "evar"
              },
              "1": {
                "0": "env",
                "type": "evar"
              },
              "type": "eapp"
            },
            "type": "eapp"
          },
          "1": {
            "0": "name",
            "type": "evar"
          },
          "type": "eapp"
        },
        "type": "elambda"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 3758
  },
  {
    "0": "tc-get",
    "1": {
      "0": "env",
      "1": {
        "0": "name",
        "1": {
          "0": {
            "0": {
              "0": "map-get",
              "type": "evar"
            },
            "1": {
              "0": {
                "0": "snd",
                "type": "evar"
              },
              "1": {
                "0": "env",
                "type": "evar"
              },
              "type": "eapp"
            },
            "type": "eapp"
          },
          "1": {
            "0": "name",
            "type": "evar"
          },
          "type": "eapp"
        },
        "type": "elambda"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 3778
  },
  {
    "0": "make-type",
    "1": {
      "0": "tname",
      "1": {
        "0": "count",
        "1": {
          "0": "loop",
          "1": {
            "0": "type",
            "1": {
              "0": "count",
              "1": {
                "0": {
                  "0": {
                    "0": {
                      "0": ">=",
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
                    "0": "count",
                    "type": "evar"
                  },
                  "type": "eapp"
                },
                "1": {
                  "0": {
                    "0": {
                      "0": true,
                      "type": "pbool"
                    },
                    "1": {
                      "0": {
                        "0": {
                          "0": ",",
                          "type": "evar"
                        },
                        "1": {
                          "0": "type",
                          "type": "evar"
                        },
                        "type": "eapp"
                      },
                      "1": {
                        "0": "nil",
                        "type": "evar"
                      },
                      "type": "eapp"
                    },
                    "type": ","
                  },
                  "1": {
                    "0": {
                      "0": {
                        "0": false,
                        "type": "pbool"
                      },
                      "1": {
                        "0": "var",
                        "1": {
                          "0": "newTV",
                          "type": "evar"
                        },
                        "2": {
                          "0": {
                            "0": {
                              "0": {
                                "0": "loop",
                                "type": "evar"
                              },
                              "1": {
                                "0": {
                                  "0": {
                                    "0": "tapp",
                                    "type": "evar"
                                  },
                                  "1": {
                                    "0": "type",
                                    "type": "evar"
                                  },
                                  "type": "eapp"
                                },
                                "1": {
                                  "0": "var",
                                  "type": "evar"
                                },
                                "type": "eapp"
                              },
                              "type": "eapp"
                            },
                            "1": {
                              "0": {
                                "0": {
                                  "0": "-",
                                  "type": "evar"
                                },
                                "1": {
                                  "0": "count",
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
                          "1": {
                            "0": {
                              "0": {
                                "0": ",",
                                "1": {
                                  "0": "type",
                                  "1": {
                                    "0": "vbls",
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
                                    "0": ",",
                                    "type": "evar"
                                  },
                                  "1": {
                                    "0": "type",
                                    "type": "evar"
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
                                      "0": "var",
                                      "type": "evar"
                                    },
                                    "type": "eapp"
                                  },
                                  "1": {
                                    "0": "vbls",
                                    "type": "evar"
                                  },
                                  "type": "eapp"
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
                          "type": "ematch"
                        },
                        "type": "elet"
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
          "2": {
            "0": {
              "0": {
                "0": "loop",
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": "tcon",
                  "type": "evar"
                },
                "1": {
                  "0": "tname",
                  "type": "evar"
                },
                "type": "eapp"
              },
              "type": "eapp"
            },
            "1": {
              "0": "count",
              "type": "evar"
            },
            "type": "eapp"
          },
          "type": "elet"
        },
        "type": "elambda"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 3791
  },
  {
    "0": {
      "0": {
        "0": {
          "0": "make-type",
          "type": "evar"
        },
        "1": {
          "0": {
            "0": "hi",
            "type": "pstr"
          },
          "type": "eprim"
        },
        "type": "eapp"
      },
      "1": {
        "0": {
          "0": 21,
          "type": "pint"
        },
        "type": "eprim"
      },
      "type": "eapp"
    },
    "type": "sexpr",
    "loc": 3853
  }
]}