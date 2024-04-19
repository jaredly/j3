return {type: 'bootstrap', stmts: [
  {
    "0": "builtins",
    "1": {
      "0": "const sanMap = { '-': '_', '+': '$pl', '*': '$ti', '=': '$eq', \n'>': '$gt', '<': '$lt', \"'\": '$qu', '\"': '$dq', ',': '$co', '@': '$at', '/': '$sl'};\n\nconst kwds = 'case var else const let var new if return default break while for super';\nconst rx = [];\nkwds.split(' ').forEach((kwd) =>\n    rx.push([new RegExp(`^${kwd}$`, 'g'), '$' + kwd]),);\nconst sanitize = (raw) => { if (raw == null) debugger;\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    rx.forEach(([rx, res]) => {\n        raw = raw.replaceAll(rx, res);\n    });\n    return raw;\n};\nconst jsonify = (raw) => JSON.stringify(raw);\nconst string_to_int = (a) => {\n    var v = parseInt(a);\n    if (!isNaN(v) && '' + v === a) return {type: 'some', 0: v}\n    return {type: 'none'}\n}\n\nconst unwrapArray = (v) => {\n    if (!v) debugger\n    return v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])]\n};\nconst $eq = (a) => (b) => a == b;\nconst fatal = (e) => {throw new Error(e)}\nconst nil = { type: 'nil' };\nconst cons = (a) => (b) => ({ type: 'cons', 0: a, 1: b });\nconst $pl$pl = (items) => unwrapArray(items).join('');\nconst $pl = (a) => (b) => a + b;\nconst _ = (a) => (b) => a - b;\nconst int_to_string = (a) => a + '';\nconst replace_all = (a) => (b) => (c) => {\n    return a.replaceAll(b, c);\n};\n\nconst unescapeString = (text) => text.replace(/\\\\\\\\./g, (matched) => {\n    if (matched[1] === 'n') {\n        return '\\\\n';\n    }\n    if (matched[1] === 't') return '\\\\t';\n    if (matched[1] === 'r') return '\\\\r';\n    return matched[1];\n});\nconst $co = (a) => (b) => ({ type: ',', 0: a, 1: b });\nconst reduce = (init) => (items) => (f) => {\n    return unwrapArray(items).reduce((a, b) => f(a)(b), init);\n};\n",
      "1": {
        "type": "nil"
      },
      "type": "estr"
    },
    "type": "sdef",
    "loc": 403
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
            "1": 2024,
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
                "0": "",
                "1": {
                  "type": "nil"
                },
                "type": "estr"
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
                    "0": "rest",
                    "1": 2180,
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
                        "1": 2184,
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
                            "1": 2046,
                            "type": "evar"
                          },
                          "1": {
                            "0": {
                              "0": {
                                "0": "cons",
                                "1": 2158,
                                "type": "evar"
                              },
                              "1": {
                                "0": "one",
                                "1": 2158,
                                "type": "evar"
                              },
                              "type": "eapp"
                            },
                            "1": {
                              "0": {
                                "0": {
                                  "0": "cons",
                                  "1": 2160,
                                  "type": "evar"
                                },
                                "1": {
                                  "0": "sep",
                                  "1": 2160,
                                  "type": "evar"
                                },
                                "type": "eapp"
                              },
                              "1": {
                                "0": {
                                  "0": {
                                    "0": "cons",
                                    "1": 2162,
                                    "type": "evar"
                                  },
                                  "1": {
                                    "0": {
                                      "0": {
                                        "0": "join",
                                        "1": 2164,
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": "sep",
                                        "1": 2166,
                                        "type": "evar"
                                      },
                                      "type": "eapp"
                                    },
                                    "1": {
                                      "0": "rest",
                                      "1": 2168,
                                      "type": "evar"
                                    },
                                    "type": "eapp"
                                  },
                                  "type": "eapp"
                                },
                                "1": {
                                  "0": "nil",
                                  "1": 2048,
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
          "1": 2082,
          "type": "evar"
        },
        "1": {
          "0": " ",
          "1": {
            "type": "nil"
          },
          "type": "estr"
        },
        "type": "eapp"
      },
      "1": {
        "0": {
          "0": {
            "0": "cons",
            "1": 2095,
            "type": "evar"
          },
          "1": {
            "0": "one",
            "1": {
              "type": "nil"
            },
            "type": "estr"
          },
          "type": "eapp"
        },
        "1": {
          "0": {
            "0": {
              "0": "cons",
              "1": 2098,
              "type": "evar"
            },
            "1": {
              "0": "two",
              "1": {
                "type": "nil"
              },
              "type": "estr"
            },
            "type": "eapp"
          },
          "1": {
            "0": {
              "0": {
                "0": "cons",
                "1": 2102,
                "type": "evar"
              },
              "1": {
                "0": "three",
                "1": {
                  "type": "nil"
                },
                "type": "estr"
              },
              "type": "eapp"
            },
            "1": {
              "0": "nil",
              "1": 2092,
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
    "1": 2080,
    "type": "sexpr",
    "loc": 2080
  },
  {
    "0": {
      "0": {
        "0": {
          "0": "join",
          "1": 3557,
          "type": "evar"
        },
        "1": {
          "0": " ",
          "1": {
            "type": "nil"
          },
          "type": "estr"
        },
        "type": "eapp"
      },
      "1": {
        "0": "nil",
        "1": 3560,
        "type": "evar"
      },
      "type": "eapp"
    },
    "1": 3555,
    "type": "sexpr",
    "loc": 3555
  },
  {
    "0": {
      "0": {
        "0": {
          "0": "join",
          "1": 3563,
          "type": "evar"
        },
        "1": {
          "0": " ",
          "1": {
            "type": "nil"
          },
          "type": "estr"
        },
        "type": "eapp"
      },
      "1": {
        "0": {
          "0": {
            "0": "cons",
            "1": 3567,
            "type": "evar"
          },
          "1": {
            "0": "one",
            "1": {
              "type": "nil"
            },
            "type": "estr"
          },
          "type": "eapp"
        },
        "1": {
          "0": "nil",
          "1": 3566,
          "type": "evar"
        },
        "type": "eapp"
      },
      "type": "eapp"
    },
    "1": 3561,
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
            "1": 2270,
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
                "1": 2274,
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
                      "0": "cons",
                      "1": 2290,
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": "f",
                        "1": 2292,
                        "type": "evar"
                      },
                      "1": {
                        "0": "one",
                        "1": 2294,
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
                        "1": 2304,
                        "type": "evar"
                      },
                      "1": {
                        "0": "rest",
                        "1": 2306,
                        "type": "evar"
                      },
                      "type": "eapp"
                    },
                    "1": {
                      "0": "f",
                      "1": 2308,
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
              "1": 2437,
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
                  "1": 2439,
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
                        "0": "cons",
                        "1": 2447,
                        "type": "evar"
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": "f",
                            "1": 2448,
                            "type": "evar"
                          },
                          "1": {
                            "0": "i",
                            "1": 2449,
                            "type": "evar"
                          },
                          "type": "eapp"
                        },
                        "1": {
                          "0": "one",
                          "1": 2462,
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
                            "1": 2454,
                            "type": "evar"
                          },
                          "1": {
                            "0": {
                              "0": {
                                "0": "+",
                                "1": 2466,
                                "type": "evar"
                              },
                              "1": {
                                "0": {
                                  "0": 1,
                                  "type": "pint"
                                },
                                "1": 2468,
                                "type": "eprim"
                              },
                              "type": "eapp"
                            },
                            "1": {
                              "0": "i",
                              "1": 2470,
                              "type": "evar"
                            },
                            "type": "eapp"
                          },
                          "type": "eapp"
                        },
                        "1": {
                          "0": "rest",
                          "1": 2455,
                          "type": "evar"
                        },
                        "type": "eapp"
                      },
                      "1": {
                        "0": "f",
                        "1": 2456,
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
              "1": 2330,
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
                  "1": 2334,
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
                        "0": {
                          "0": "foldl",
                          "1": 2354,
                          "type": "evar"
                        },
                        "1": {
                          "0": {
                            "0": {
                              "0": "f",
                              "1": 2358,
                              "type": "evar"
                            },
                            "1": {
                              "0": "init",
                              "1": 2360,
                              "type": "evar"
                            },
                            "type": "eapp"
                          },
                          "1": {
                            "0": "one",
                            "1": 2362,
                            "type": "evar"
                          },
                          "type": "eapp"
                        },
                        "type": "eapp"
                      },
                      "1": {
                        "0": "rest",
                        "1": 2364,
                        "type": "evar"
                      },
                      "type": "eapp"
                    },
                    "1": {
                      "0": "f",
                      "1": 2366,
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
              "1": 2692,
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
                  "1": 2694,
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
                        "1": 2712,
                        "type": "evar"
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": {
                              "0": "foldr",
                              "1": 2716,
                              "type": "evar"
                            },
                            "1": {
                              "0": "init",
                              "1": 2718,
                              "type": "evar"
                            },
                            "type": "eapp"
                          },
                          "1": {
                            "0": "rest",
                            "1": 2720,
                            "type": "evar"
                          },
                          "type": "eapp"
                        },
                        "1": {
                          "0": "f",
                          "1": 2722,
                          "type": "evar"
                        },
                        "type": "eapp"
                      },
                      "type": "eapp"
                    },
                    "1": {
                      "0": "one",
                      "1": 2724,
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
            "1": 2370,
            "type": "evar"
          },
          "1": {
            "0": {
              "0": 0,
              "type": "pint"
            },
            "1": 2372,
            "type": "eprim"
          },
          "type": "eapp"
        },
        "1": {
          "0": {
            "0": {
              "0": "cons",
              "1": 2376,
              "type": "evar"
            },
            "1": {
              "0": {
                "0": 1,
                "type": "pint"
              },
              "1": 2376,
              "type": "eprim"
            },
            "type": "eapp"
          },
          "1": {
            "0": {
              "0": {
                "0": "cons",
                "1": 2378,
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": 2,
                  "type": "pint"
                },
                "1": 2378,
                "type": "eprim"
              },
              "type": "eapp"
            },
            "1": {
              "0": {
                "0": {
                  "0": "cons",
                  "1": 2380,
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": 3,
                    "type": "pint"
                  },
                  "1": 2380,
                  "type": "eprim"
                },
                "type": "eapp"
              },
              "1": {
                "0": {
                  "0": {
                    "0": "cons",
                    "1": 2382,
                    "type": "evar"
                  },
                  "1": {
                    "0": {
                      "0": 4,
                      "type": "pint"
                    },
                    "1": 2382,
                    "type": "eprim"
                  },
                  "type": "eapp"
                },
                "1": {
                  "0": "nil",
                  "1": 2374,
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
        "1": 2384,
        "type": "evar"
      },
      "type": "eapp"
    },
    "1": 2368,
    "type": "sexpr",
    "loc": 2368
  },
  {
    "0": {
      "0": {
        "0": {
          "0": {
            "0": "foldr",
            "1": 2728,
            "type": "evar"
          },
          "1": {
            "0": {
              "0": 5,
              "type": "pint"
            },
            "1": 2730,
            "type": "eprim"
          },
          "type": "eapp"
        },
        "1": {
          "0": {
            "0": {
              "0": "cons",
              "1": 2734,
              "type": "evar"
            },
            "1": {
              "0": {
                "0": 1,
                "type": "pint"
              },
              "1": 2734,
              "type": "eprim"
            },
            "type": "eapp"
          },
          "1": {
            "0": {
              "0": {
                "0": "cons",
                "1": 2736,
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": 2,
                  "type": "pint"
                },
                "1": 2736,
                "type": "eprim"
              },
              "type": "eapp"
            },
            "1": {
              "0": {
                "0": {
                  "0": "cons",
                  "1": 2738,
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": 3,
                    "type": "pint"
                  },
                  "1": 2738,
                  "type": "eprim"
                },
                "type": "eapp"
              },
              "1": {
                "0": {
                  "0": {
                    "0": "cons",
                    "1": 2740,
                    "type": "evar"
                  },
                  "1": {
                    "0": {
                      "0": 4,
                      "type": "pint"
                    },
                    "1": 2740,
                    "type": "eprim"
                  },
                  "type": "eapp"
                },
                "1": {
                  "0": "nil",
                  "1": 2732,
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
        "1": 2744,
        "type": "evar"
      },
      "type": "eapp"
    },
    "1": 2726,
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
              "1": 2808,
              "type": "evar"
            },
            "1": {
              "0": "b",
              "1": 2810,
              "type": "evar"
            },
            "type": "eapp"
          },
          "1": {
            "0": "a",
            "1": 2812,
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
            "1": 2748,
            "type": "evar"
          },
          "1": {
            "0": "nil",
            "1": 2750,
            "type": "evar"
          },
          "type": "eapp"
        },
        "1": {
          "0": {
            "0": {
              "0": "cons",
              "1": 2754,
              "type": "evar"
            },
            "1": {
              "0": {
                "0": 1,
                "type": "pint"
              },
              "1": 2754,
              "type": "eprim"
            },
            "type": "eapp"
          },
          "1": {
            "0": {
              "0": {
                "0": "cons",
                "1": 2756,
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": 2,
                  "type": "pint"
                },
                "1": 2756,
                "type": "eprim"
              },
              "type": "eapp"
            },
            "1": {
              "0": {
                "0": {
                  "0": "cons",
                  "1": 2758,
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": 3,
                    "type": "pint"
                  },
                  "1": 2758,
                  "type": "eprim"
                },
                "type": "eapp"
              },
              "1": {
                "0": {
                  "0": {
                    "0": "cons",
                    "1": 2760,
                    "type": "evar"
                  },
                  "1": {
                    "0": {
                      "0": 4,
                      "type": "pint"
                    },
                    "1": 2760,
                    "type": "eprim"
                  },
                  "type": "eapp"
                },
                "1": {
                  "0": "nil",
                  "1": 2752,
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
        "1": 2764,
        "type": "evar"
      },
      "type": "eapp"
    },
    "1": 2746,
    "type": "sexpr",
    "loc": 2746
  },
  {
    "0": {
      "0": "\\\\",
      "1": {
        "type": "nil"
      },
      "type": "estr"
    },
    "1": 4622,
    "type": "sexpr",
    "loc": 4622
  },
  {
    "0": {
      "0": "\\n",
      "1": {
        "type": "nil"
      },
      "type": "estr"
    },
    "1": 4625,
    "type": "sexpr",
    "loc": 4625
  },
  {
    "0": {
      "0": "\\\\n",
      "1": {
        "type": "nil"
      },
      "type": "estr"
    },
    "1": 4628,
    "type": "sexpr",
    "loc": 4628
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
            "0": "pprim",
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
    "0": "literal-constr",
    "1": {
      "0": "name",
      "1": {
        "0": "args",
        "1": {
          "0": {
            "0": "++",
            "1": 3132,
            "type": "evar"
          },
          "1": {
            "0": {
              "0": {
                "0": "cons",
                "1": 3166,
                "type": "evar"
              },
              "1": {
                "0": "({type: \\\"",
                "1": {
                  "type": "nil"
                },
                "type": "estr"
              },
              "type": "eapp"
            },
            "1": {
              "0": {
                "0": {
                  "0": "cons",
                  "1": 3168,
                  "type": "evar"
                },
                "1": {
                  "0": "name",
                  "1": 3168,
                  "type": "evar"
                },
                "type": "eapp"
              },
              "1": {
                "0": {
                  "0": {
                    "0": "cons",
                    "1": 3169,
                    "type": "evar"
                  },
                  "1": {
                    "0": "\"",
                    "1": {
                      "type": "nil"
                    },
                    "type": "estr"
                  },
                  "type": "eapp"
                },
                "1": {
                  "0": {
                    "0": {
                      "0": "cons",
                      "1": 3171,
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": "++",
                        "1": 3172,
                        "type": "evar"
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": {
                              "0": "mapi",
                              "1": 3174,
                              "type": "evar"
                            },
                            "1": {
                              "0": {
                                "0": 0,
                                "type": "pint"
                              },
                              "1": 3175,
                              "type": "eprim"
                            },
                            "type": "eapp"
                          },
                          "1": {
                            "0": "args",
                            "1": 3176,
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
                                "1": 3183,
                                "type": "evar"
                              },
                              "1": {
                                "0": {
                                  "0": {
                                    "0": "cons",
                                    "1": 3185,
                                    "type": "evar"
                                  },
                                  "1": {
                                    "0": ", ",
                                    "1": {
                                      "type": "nil"
                                    },
                                    "type": "estr"
                                  },
                                  "type": "eapp"
                                },
                                "1": {
                                  "0": {
                                    "0": {
                                      "0": "cons",
                                      "1": 3187,
                                      "type": "evar"
                                    },
                                    "1": {
                                      "0": {
                                        "0": "int-to-string",
                                        "1": 3188,
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": "i",
                                        "1": 3189,
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
                                        "1": 3190,
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": ": ",
                                        "1": {
                                          "type": "nil"
                                        },
                                        "type": "estr"
                                      },
                                      "type": "eapp"
                                    },
                                    "1": {
                                      "0": {
                                        "0": {
                                          "0": "cons",
                                          "1": 3192,
                                          "type": "evar"
                                        },
                                        "1": {
                                          "0": "arg",
                                          "1": 3192,
                                          "type": "evar"
                                        },
                                        "type": "eapp"
                                      },
                                      "1": {
                                        "0": "nil",
                                        "1": 3184,
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
                        "1": 3195,
                        "type": "evar"
                      },
                      "1": {
                        "0": "})",
                        "1": {
                          "type": "nil"
                        },
                        "type": "estr"
                      },
                      "type": "eapp"
                    },
                    "1": {
                      "0": "nil",
                      "1": 3134,
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
          "1": 3202,
          "type": "evar"
        },
        "1": {
          "0": "cons",
          "1": {
            "type": "nil"
          },
          "type": "estr"
        },
        "type": "eapp"
      },
      "1": {
        "0": {
          "0": {
            "0": "cons",
            "1": 3215,
            "type": "evar"
          },
          "1": {
            "0": "0",
            "1": {
              "type": "nil"
            },
            "type": "estr"
          },
          "type": "eapp"
        },
        "1": {
          "0": "nil",
          "1": 3212,
          "type": "evar"
        },
        "type": "eapp"
      },
      "type": "eapp"
    },
    "1": 3200,
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
          "1": 731,
          "type": "evar"
        },
        "1": {
          "0": {
            "0": {
              "0": "sexpr",
              "1": {
                "0": {
                  "0": "expr",
                  "type": "pvar"
                },
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
                "1": 736,
                "type": "evar"
              },
              "1": {
                "0": "expr",
                "1": 737,
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
                  "0": {
                    "0": "name",
                    "type": "pvar"
                  },
                  "1": {
                    "0": {
                      "0": "body",
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
                  "0": "++",
                  "1": 743,
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": {
                      "0": "cons",
                      "1": 745,
                      "type": "evar"
                    },
                    "1": {
                      "0": "const ",
                      "1": {
                        "type": "nil"
                      },
                      "type": "estr"
                    },
                    "type": "eapp"
                  },
                  "1": {
                    "0": {
                      "0": {
                        "0": "cons",
                        "1": 747,
                        "type": "evar"
                      },
                      "1": {
                        "0": {
                          "0": "sanitize",
                          "1": 748,
                          "type": "evar"
                        },
                        "1": {
                          "0": "name",
                          "1": 749,
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
                          "1": 750,
                          "type": "evar"
                        },
                        "1": {
                          "0": " = ",
                          "1": {
                            "type": "nil"
                          },
                          "type": "estr"
                        },
                        "type": "eapp"
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": "cons",
                            "1": 752,
                            "type": "evar"
                          },
                          "1": {
                            "0": {
                              "0": "compile",
                              "1": 753,
                              "type": "evar"
                            },
                            "1": {
                              "0": "body",
                              "1": 754,
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
                              "1": 755,
                              "type": "evar"
                            },
                            "1": {
                              "0": ";\\n",
                              "1": {
                                "type": "nil"
                              },
                              "type": "estr"
                            },
                            "type": "eapp"
                          },
                          "1": {
                            "0": "nil",
                            "1": 744,
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
                    "0": {
                      "0": "name",
                      "type": "pvar"
                    },
                    "1": {
                      "0": {
                        "0": "cases",
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
                      "0": "join",
                      "1": 2190,
                      "type": "evar"
                    },
                    "1": {
                      "0": "\\n",
                      "1": {
                        "type": "nil"
                      },
                      "type": "estr"
                    },
                    "type": "eapp"
                  },
                  "1": {
                    "0": {
                      "0": {
                        "0": "map",
                        "1": 2198,
                        "type": "evar"
                      },
                      "1": {
                        "0": "cases",
                        "1": 2200,
                        "type": "evar"
                      },
                      "type": "eapp"
                    },
                    "1": {
                      "0": "case",
                      "1": {
                        "0": {
                          "0": "case",
                          "1": 2310,
                          "type": "evar"
                        },
                        "1": {
                          "0": {
                            "0": {
                              "0": ",",
                              "1": {
                                "0": {
                                  "0": "name2",
                                  "type": "pvar"
                                },
                                "1": {
                                  "0": {
                                    "0": "args",
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
                                "0": "++",
                                "1": 2234,
                                "type": "evar"
                              },
                              "1": {
                                "0": {
                                  "0": {
                                    "0": "cons",
                                    "1": 2239,
                                    "type": "evar"
                                  },
                                  "1": {
                                    "0": "const ",
                                    "1": {
                                      "type": "nil"
                                    },
                                    "type": "estr"
                                  },
                                  "type": "eapp"
                                },
                                "1": {
                                  "0": {
                                    "0": {
                                      "0": "cons",
                                      "1": 3932,
                                      "type": "evar"
                                    },
                                    "1": {
                                      "0": {
                                        "0": "sanitize",
                                        "1": 2242,
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": "name2",
                                        "1": 3934,
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
                                        "1": 2244,
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": " = ",
                                        "1": {
                                          "type": "nil"
                                        },
                                        "type": "estr"
                                      },
                                      "type": "eapp"
                                    },
                                    "1": {
                                      "0": {
                                        "0": {
                                          "0": "cons",
                                          "1": 2484,
                                          "type": "evar"
                                        },
                                        "1": {
                                          "0": {
                                            "0": "++",
                                            "1": 2486,
                                            "type": "evar"
                                          },
                                          "1": {
                                            "0": {
                                              "0": {
                                                "0": {
                                                  "0": "mapi",
                                                  "1": 2392,
                                                  "type": "evar"
                                                },
                                                "1": {
                                                  "0": {
                                                    "0": 0,
                                                    "type": "pint"
                                                  },
                                                  "1": 2472,
                                                  "type": "eprim"
                                                },
                                                "type": "eapp"
                                              },
                                              "1": {
                                                "0": "args",
                                                "1": 2394,
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
                                                    "1": 2492,
                                                    "type": "evar"
                                                  },
                                                  "1": {
                                                    "0": {
                                                      "0": {
                                                        "0": "cons",
                                                        "1": 2514,
                                                        "type": "evar"
                                                      },
                                                      "1": {
                                                        "0": "(v",
                                                        "1": {
                                                          "type": "nil"
                                                        },
                                                        "type": "estr"
                                                      },
                                                      "type": "eapp"
                                                    },
                                                    "1": {
                                                      "0": {
                                                        "0": {
                                                          "0": "cons",
                                                          "1": 2516,
                                                          "type": "evar"
                                                        },
                                                        "1": {
                                                          "0": {
                                                            "0": "int-to-string",
                                                            "1": 2517,
                                                            "type": "evar"
                                                          },
                                                          "1": {
                                                            "0": "i",
                                                            "1": 2518,
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
                                                            "1": 2519,
                                                            "type": "evar"
                                                          },
                                                          "1": {
                                                            "0": ") => ",
                                                            "1": {
                                                              "type": "nil"
                                                            },
                                                            "type": "estr"
                                                          },
                                                          "type": "eapp"
                                                        },
                                                        "1": {
                                                          "0": "nil",
                                                          "1": 2506,
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
                                            "1": 2522,
                                            "type": "evar"
                                          },
                                          "1": {
                                            "0": "({type: \\\"",
                                            "1": {
                                              "type": "nil"
                                            },
                                            "type": "estr"
                                          },
                                          "type": "eapp"
                                        },
                                        "1": {
                                          "0": {
                                            "0": {
                                              "0": "cons",
                                              "1": 2530,
                                              "type": "evar"
                                            },
                                            "1": {
                                              "0": "name2",
                                              "1": 2530,
                                              "type": "evar"
                                            },
                                            "type": "eapp"
                                          },
                                          "1": {
                                            "0": {
                                              "0": {
                                                "0": "cons",
                                                "1": 2532,
                                                "type": "evar"
                                              },
                                              "1": {
                                                "0": "\\\"",
                                                "1": {
                                                  "type": "nil"
                                                },
                                                "type": "estr"
                                              },
                                              "type": "eapp"
                                            },
                                            "1": {
                                              "0": {
                                                "0": {
                                                  "0": "cons",
                                                  "1": 2536,
                                                  "type": "evar"
                                                },
                                                "1": {
                                                  "0": {
                                                    "0": "++",
                                                    "1": 2548,
                                                    "type": "evar"
                                                  },
                                                  "1": {
                                                    "0": {
                                                      "0": {
                                                        "0": {
                                                          "0": "mapi",
                                                          "1": 2552,
                                                          "type": "evar"
                                                        },
                                                        "1": {
                                                          "0": {
                                                            "0": 0,
                                                            "type": "pint"
                                                          },
                                                          "1": 2554,
                                                          "type": "eprim"
                                                        },
                                                        "type": "eapp"
                                                      },
                                                      "1": {
                                                        "0": "args",
                                                        "1": 2556,
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
                                                            "1": 2570,
                                                            "type": "evar"
                                                          },
                                                          "1": {
                                                            "0": {
                                                              "0": {
                                                                "0": "cons",
                                                                "1": 2584,
                                                                "type": "evar"
                                                              },
                                                              "1": {
                                                                "0": ", ",
                                                                "1": {
                                                                  "type": "nil"
                                                                },
                                                                "type": "estr"
                                                              },
                                                              "type": "eapp"
                                                            },
                                                            "1": {
                                                              "0": {
                                                                "0": {
                                                                  "0": "cons",
                                                                  "1": 2588,
                                                                  "type": "evar"
                                                                },
                                                                "1": {
                                                                  "0": {
                                                                    "0": "int-to-string",
                                                                    "1": 2590,
                                                                    "type": "evar"
                                                                  },
                                                                  "1": {
                                                                    "0": "i",
                                                                    "1": 2592,
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
                                                                    "1": 2575,
                                                                    "type": "evar"
                                                                  },
                                                                  "1": {
                                                                    "0": ": v",
                                                                    "1": {
                                                                      "type": "nil"
                                                                    },
                                                                    "type": "estr"
                                                                  },
                                                                  "type": "eapp"
                                                                },
                                                                "1": {
                                                                  "0": {
                                                                    "0": {
                                                                      "0": "cons",
                                                                      "1": 2578,
                                                                      "type": "evar"
                                                                    },
                                                                    "1": {
                                                                      "0": {
                                                                        "0": "int-to-string",
                                                                        "1": 2580,
                                                                        "type": "evar"
                                                                      },
                                                                      "1": {
                                                                        "0": "i",
                                                                        "1": 2582,
                                                                        "type": "evar"
                                                                      },
                                                                      "type": "eapp"
                                                                    },
                                                                    "type": "eapp"
                                                                  },
                                                                  "1": {
                                                                    "0": "nil",
                                                                    "1": 2572,
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
                                                    "1": 2594,
                                                    "type": "evar"
                                                  },
                                                  "1": {
                                                    "0": "});",
                                                    "1": {
                                                      "type": "nil"
                                                    },
                                                    "type": "estr"
                                                  },
                                                  "type": "eapp"
                                                },
                                                "1": {
                                                  "0": "nil",
                                                  "1": 2236,
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
    "0": "snd",
    "1": {
      "0": "tuple",
      "1": {
        "0": {
          "0": "tuple",
          "1": 811,
          "type": "evar"
        },
        "1": {
          "0": {
            "0": {
              "0": ",",
              "1": {
                "0": {
                  "type": "pany"
                },
                "1": {
                  "0": {
                    "0": "v",
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
              "0": "v",
              "1": 812,
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
          "1": 825,
          "type": "evar"
        },
        "1": {
          "0": {
            "0": {
              "0": ",",
              "1": {
                "0": {
                  "0": "v",
                  "type": "pvar"
                },
                "1": {
                  "0": {
                    "type": "pany"
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
              "0": "v",
              "1": 826,
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
            "1": 2882,
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
                "1": 2886,
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
                    "0": "one",
                    "1": 2968,
                    "type": "evar"
                  },
                  "1": {
                    "0": {
                      "0": {
                        "0": ",",
                        "1": {
                          "0": {
                            "0": "find",
                            "type": "pvar"
                          },
                          "1": {
                            "0": {
                              "0": "nw",
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
                            "0": "replaces",
                            "1": 2986,
                            "type": "evar"
                          },
                          "1": {
                            "0": {
                              "0": {
                                "0": {
                                  "0": "replace-all",
                                  "1": 2988,
                                  "type": "evar"
                                },
                                "1": {
                                  "0": "target",
                                  "1": 2989,
                                  "type": "evar"
                                },
                                "type": "eapp"
                              },
                              "1": {
                                "0": "find",
                                "1": 2990,
                                "type": "evar"
                              },
                              "type": "eapp"
                            },
                            "1": {
                              "0": "nw",
                              "1": 2991,
                              "type": "evar"
                            },
                            "type": "eapp"
                          },
                          "type": "eapp"
                        },
                        "1": {
                          "0": "rest",
                          "1": 2992,
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
          "1": 2932,
          "type": "evar"
        },
        "1": {
          "0": "\\n",
          "1": {
            "type": "nil"
          },
          "type": "estr"
        },
        "type": "eapp"
      },
      "1": {
        "0": {
          "0": {
            "0": "cons",
            "1": 3282,
            "type": "evar"
          },
          "1": {
            "0": {
              "0": {
                "0": ",",
                "1": 3284,
                "type": "evar"
              },
              "1": {
                "0": "\\\\",
                "1": {
                  "type": "nil"
                },
                "type": "estr"
              },
              "type": "eapp"
            },
            "1": {
              "0": "\\\\\\\\",
              "1": {
                "type": "nil"
              },
              "type": "estr"
            },
            "type": "eapp"
          },
          "type": "eapp"
        },
        "1": {
          "0": {
            "0": {
              "0": "cons",
              "1": 3294,
              "type": "evar"
            },
            "1": {
              "0": {
                "0": {
                  "0": ",",
                  "1": 3296,
                  "type": "evar"
                },
                "1": {
                  "0": "\\n",
                  "1": {
                    "type": "nil"
                  },
                  "type": "estr"
                },
                "type": "eapp"
              },
              "1": {
                "0": "\\\\n",
                "1": {
                  "type": "nil"
                },
                "type": "estr"
              },
              "type": "eapp"
            },
            "type": "eapp"
          },
          "1": {
            "0": "nil",
            "1": 2938,
            "type": "evar"
          },
          "type": "eapp"
        },
        "type": "eapp"
      },
      "type": "eapp"
    },
    "1": 2930,
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
            "1": 3316,
            "type": "evar"
          },
          "1": {
            "0": "string",
            "1": 3318,
            "type": "evar"
          },
          "type": "eapp"
        },
        "1": {
          "0": {
            "0": {
              "0": "cons",
              "1": 3322,
              "type": "evar"
            },
            "1": {
              "0": {
                "0": {
                  "0": ",",
                  "1": 3324,
                  "type": "evar"
                },
                "1": {
                  "0": "\\\\",
                  "1": {
                    "type": "nil"
                  },
                  "type": "estr"
                },
                "type": "eapp"
              },
              "1": {
                "0": "\\\\\\\\",
                "1": {
                  "type": "nil"
                },
                "type": "estr"
              },
              "type": "eapp"
            },
            "type": "eapp"
          },
          "1": {
            "0": {
              "0": {
                "0": "cons",
                "1": 3334,
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": {
                    "0": ",",
                    "1": 3336,
                    "type": "evar"
                  },
                  "1": {
                    "0": "\\n",
                    "1": {
                      "type": "nil"
                    },
                    "type": "estr"
                  },
                  "type": "eapp"
                },
                "1": {
                  "0": "\\\\n",
                  "1": {
                    "type": "nil"
                  },
                  "type": "estr"
                },
                "type": "eapp"
              },
              "type": "eapp"
            },
            "1": {
              "0": {
                "0": {
                  "0": "cons",
                  "1": 3346,
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": {
                      "0": ",",
                      "1": 3348,
                      "type": "evar"
                    },
                    "1": {
                      "0": "\\\"",
                      "1": {
                        "type": "nil"
                      },
                      "type": "estr"
                    },
                    "type": "eapp"
                  },
                  "1": {
                    "0": "\\\\\"",
                    "1": {
                      "type": "nil"
                    },
                    "type": "estr"
                  },
                  "type": "eapp"
                },
                "type": "eapp"
              },
              "1": {
                "0": {
                  "0": {
                    "0": "cons",
                    "1": 4474,
                    "type": "evar"
                  },
                  "1": {
                    "0": {
                      "0": {
                        "0": ",",
                        "1": 4475,
                        "type": "evar"
                      },
                      "1": {
                        "0": "`",
                        "1": {
                          "type": "nil"
                        },
                        "type": "estr"
                      },
                      "type": "eapp"
                    },
                    "1": {
                      "0": "\\\\`",
                      "1": {
                        "type": "nil"
                      },
                      "type": "estr"
                    },
                    "type": "eapp"
                  },
                  "type": "eapp"
                },
                "1": {
                  "0": {
                    "0": {
                      "0": "cons",
                      "1": 4480,
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": {
                          "0": ",",
                          "1": 4481,
                          "type": "evar"
                        },
                        "1": {
                          "0": "$",
                          "1": {
                            "type": "nil"
                          },
                          "type": "estr"
                        },
                        "type": "eapp"
                      },
                      "1": {
                        "0": "\\\\$",
                        "1": {
                          "type": "nil"
                        },
                        "type": "estr"
                      },
                      "type": "eapp"
                    },
                    "type": "eapp"
                  },
                  "1": {
                    "0": "nil",
                    "1": 3320,
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
            "1": 3368,
            "type": "evar"
          },
          "1": {
            "0": "string",
            "1": 3370,
            "type": "evar"
          },
          "type": "eapp"
        },
        "1": {
          "0": {
            "0": {
              "0": "cons",
              "1": 4614,
              "type": "evar"
            },
            "1": {
              "0": {
                "0": {
                  "0": ",",
                  "1": 4617,
                  "type": "evar"
                },
                "1": {
                  "0": "\\\\n",
                  "1": {
                    "type": "nil"
                  },
                  "type": "estr"
                },
                "type": "eapp"
              },
              "1": {
                "0": "\\n",
                "1": {
                  "type": "nil"
                },
                "type": "estr"
              },
              "type": "eapp"
            },
            "type": "eapp"
          },
          "1": {
            "0": {
              "0": {
                "0": "cons",
                "1": 4529,
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": {
                    "0": ",",
                    "1": 4536,
                    "type": "evar"
                  },
                  "1": {
                    "0": "\\\\\\\\",
                    "1": {
                      "type": "nil"
                    },
                    "type": "estr"
                  },
                  "type": "eapp"
                },
                "1": {
                  "0": "\\\\",
                  "1": {
                    "type": "nil"
                  },
                  "type": "estr"
                },
                "type": "eapp"
              },
              "type": "eapp"
            },
            "1": {
              "0": {
                "0": {
                  "0": "cons",
                  "1": 3374,
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": {
                      "0": ",",
                      "1": 3376,
                      "type": "evar"
                    },
                    "1": {
                      "0": "\\\\\"",
                      "1": {
                        "type": "nil"
                      },
                      "type": "estr"
                    },
                    "type": "eapp"
                  },
                  "1": {
                    "0": "\\\"",
                    "1": {
                      "type": "nil"
                    },
                    "type": "estr"
                  },
                  "type": "eapp"
                },
                "type": "eapp"
              },
              "1": {
                "0": "nil",
                "1": 3372,
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
    "0": {
      "0": {
        "0": "unescape-string",
        "1": 4541,
        "type": "evar"
      },
      "1": {
        "0": "\\\\n",
        "1": {
          "type": "nil"
        },
        "type": "estr"
      },
      "type": "eapp"
    },
    "1": 4526,
    "type": "sexpr",
    "loc": 4526
  },
  {
    "0": {
      "0": {
        "0": "escape-string",
        "1": 4592,
        "type": "evar"
      },
      "1": {
        "0": "\\\\n",
        "1": {
          "type": "nil"
        },
        "type": "estr"
      },
      "type": "eapp"
    },
    "1": 4590,
    "type": "sexpr",
    "loc": 4590
  },
  {
    "0": {
      "0": "\\\\n",
      "1": {
        "type": "nil"
      },
      "type": "estr"
    },
    "1": 4595,
    "type": "sexpr",
    "loc": 4595
  },
  {
    "0": {
      "0": "\\",
      "1": {
        "type": "nil"
      },
      "type": "estr"
    },
    "1": 4598,
    "type": "sexpr",
    "loc": 4598
  },
  {
    "0": {
      "0": "\\\\",
      "1": {
        "type": "nil"
      },
      "type": "estr"
    },
    "1": 4601,
    "type": "sexpr",
    "loc": 4601
  },
  {
    "0": {
      "0": {
        "0": "unescape-string",
        "1": 4609,
        "type": "evar"
      },
      "1": {
        "0": {
          "0": "escape-string",
          "1": 4611,
          "type": "evar"
        },
        "1": {
          "0": "\\\\n",
          "1": {
            "type": "nil"
          },
          "type": "estr"
        },
        "type": "eapp"
      },
      "type": "eapp"
    },
    "1": 4607,
    "type": "sexpr",
    "loc": 4607
  },
  {
    "0": {
      "0": "\\n",
      "1": {
        "type": "nil"
      },
      "type": "estr"
    },
    "1": 4544,
    "type": "sexpr",
    "loc": 4544
  },
  {
    "0": {
      "0": "\\\\n",
      "1": {
        "type": "nil"
      },
      "type": "estr"
    },
    "1": 4547,
    "type": "sexpr",
    "loc": 4547
  },
  {
    "0": {
      "0": {
        "0": "escape-string",
        "1": 4552,
        "type": "evar"
      },
      "1": {
        "0": "\\n",
        "1": {
          "type": "nil"
        },
        "type": "estr"
      },
      "type": "eapp"
    },
    "1": 4550,
    "type": "sexpr",
    "loc": 4550
  },
  {
    "0": "quot",
    "1": {
      "0": "expr",
      "1": {
        "0": {
          "0": "expr",
          "1": 3088,
          "type": "evar"
        },
        "1": {
          "0": {
            "0": {
              "0": "eprim",
              "1": {
                "0": {
                  "0": "prim",
                  "type": "pvar"
                },
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
                "1": 3100,
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": {
                    "0": "pstr",
                    "1": {
                      "0": {
                        "0": "string",
                        "type": "pvar"
                      },
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
                      "1": 3110,
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": {
                          "0": "cons",
                          "1": 3115,
                          "type": "evar"
                        },
                        "1": {
                          "0": "{type: ",
                          "1": {
                            "type": "nil"
                          },
                          "type": "estr"
                        },
                        "type": "eapp"
                      },
                      "1": {
                        "0": "nil",
                        "1": 3112,
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
    "0": "pat-loop",
    "1": {
      "0": "target",
      "1": {
        "0": "args",
        "1": {
          "0": "i",
          "1": {
            "0": "inner",
            "1": {
              "0": {
                "0": "args",
                "1": 4259,
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
                    "0": "inner",
                    "1": 4261,
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
                          "0": "arg",
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
                          "0": {
                            "0": "compile-pat",
                            "1": 4269,
                            "type": "evar"
                          },
                          "1": {
                            "0": "arg",
                            "1": 4270,
                            "type": "evar"
                          },
                          "type": "eapp"
                        },
                        "1": {
                          "0": "",
                          "1": {
                            "0": {
                              "0": {
                                "0": "target",
                                "1": 4297,
                                "type": "evar"
                              },
                              "1": "[",
                              "type": ","
                            },
                            "1": {
                              "0": {
                                "0": {
                                  "0": "i",
                                  "1": 4295,
                                  "type": "evar"
                                },
                                "1": "]",
                                "type": ","
                              },
                              "1": {
                                "type": "nil"
                              },
                              "type": "cons"
                            },
                            "type": "cons"
                          },
                          "type": "estr"
                        },
                        "type": "eapp"
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": {
                              "0": {
                                "0": "pat-loop",
                                "1": 4274,
                                "type": "evar"
                              },
                              "1": {
                                "0": "target",
                                "1": 4275,
                                "type": "evar"
                              },
                              "type": "eapp"
                            },
                            "1": {
                              "0": "rest",
                              "1": 4301,
                              "type": "evar"
                            },
                            "type": "eapp"
                          },
                          "1": {
                            "0": {
                              "0": {
                                "0": "+",
                                "1": 4277,
                                "type": "evar"
                              },
                              "1": {
                                "0": "i",
                                "1": 4278,
                                "type": "evar"
                              },
                              "type": "eapp"
                            },
                            "1": {
                              "0": {
                                "0": 1,
                                "type": "pint"
                              },
                              "1": 4279,
                              "type": "eprim"
                            },
                            "type": "eapp"
                          },
                          "type": "eapp"
                        },
                        "1": {
                          "0": "inner",
                          "1": 4282,
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
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 4251
  },
  {
    "0": {
      "0": {
        "0": {
          "0": "map",
          "1": 4329,
          "type": "evar"
        },
        "1": {
          "0": "nil",
          "1": 4332,
          "type": "evar"
        },
        "type": "eapp"
      },
      "1": {
        "0": "+",
        "1": 4333,
        "type": "evar"
      },
      "type": "eapp"
    },
    "1": 4327,
    "type": "sexpr",
    "loc": 4327
  },
  {
    "0": {
      "0": {
        "0": {
          "0": "join",
          "1": 4369,
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
      "1": {
        "0": "nil",
        "1": 4375,
        "type": "evar"
      },
      "type": "eapp"
    },
    "1": 4367,
    "type": "sexpr",
    "loc": 4367
  },
  {
    "0": "compile-pat",
    "1": {
      "0": "pat",
      "1": {
        "0": "target",
        "1": {
          "0": "inner",
          "1": {
            "0": {
              "0": "pat",
              "1": 4087,
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
                  "0": "inner",
                  "1": 4090,
                  "type": "evar"
                },
                "type": ","
              },
              "1": {
                "0": {
                  "0": {
                    "0": "pprim",
                    "1": {
                      "0": {
                        "0": "prim",
                        "type": "pvar"
                      },
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
                      "1": 4098,
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": {
                          "0": "pint",
                          "1": {
                            "0": {
                              "0": "int",
                              "type": "pvar"
                            },
                            "1": {
                              "type": "nil"
                            },
                            "type": "cons"
                          },
                          "type": "pcon"
                        },
                        "1": {
                          "0": "if (",
                          "1": {
                            "0": {
                              "0": {
                                "0": "target",
                                "1": 4224,
                                "type": "evar"
                              },
                              "1": " === ",
                              "type": ","
                            },
                            "1": {
                              "0": {
                                "0": {
                                  "0": "int",
                                  "1": 4138,
                                  "type": "evar"
                                },
                                "1": ") {\\n",
                                "type": ","
                              },
                              "1": {
                                "0": {
                                  "0": {
                                    "0": "inner",
                                    "1": 4140,
                                    "type": "evar"
                                  },
                                  "1": "\\n}",
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
                          "type": "estr"
                        },
                        "type": ","
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": "pbool",
                            "1": {
                              "0": {
                                "0": "bool",
                                "type": "pvar"
                              },
                              "1": {
                                "type": "nil"
                              },
                              "type": "cons"
                            },
                            "type": "pcon"
                          },
                          "1": {
                            "0": "if (",
                            "1": {
                              "0": {
                                "0": {
                                  "0": "target",
                                  "1": 4226,
                                  "type": "evar"
                                },
                                "1": " === ",
                                "type": ","
                              },
                              "1": {
                                "0": {
                                  "0": {
                                    "0": "bool",
                                    "1": 4143,
                                    "type": "evar"
                                  },
                                  "1": ") {\\n",
                                  "type": ","
                                },
                                "1": {
                                  "0": {
                                    "0": {
                                      "0": "inner",
                                      "1": 4145,
                                      "type": "evar"
                                    },
                                    "1": "\\n}",
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
                            "type": "estr"
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
                      "0": "pstr",
                      "1": {
                        "0": {
                          "0": "str",
                          "type": "pvar"
                        },
                        "1": {
                          "type": "nil"
                        },
                        "type": "cons"
                      },
                      "type": "pcon"
                    },
                    "1": {
                      "0": "if (",
                      "1": {
                        "0": {
                          "0": {
                            "0": "target",
                            "1": 4230,
                            "type": "evar"
                          },
                          "1": " === \\\"",
                          "type": ","
                        },
                        "1": {
                          "0": {
                            "0": {
                              "0": "str",
                              "1": 4156,
                              "type": "evar"
                            },
                            "1": "\\\"){\\n",
                            "type": ","
                          },
                          "1": {
                            "0": {
                              "0": {
                                "0": "inner",
                                "1": 4158,
                                "type": "evar"
                              },
                              "1": "\\n}",
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
                      "type": "estr"
                    },
                    "type": ","
                  },
                  "1": {
                    "0": {
                      "0": {
                        "0": "pvar",
                        "1": {
                          "0": {
                            "0": "name",
                            "type": "pvar"
                          },
                          "1": {
                            "type": "nil"
                          },
                          "type": "cons"
                        },
                        "type": "pcon"
                      },
                      "1": {
                        "0": "{\\nlet ",
                        "1": {
                          "0": {
                            "0": {
                              "0": {
                                "0": "sanitize",
                                "1": 4473,
                                "type": "evar"
                              },
                              "1": {
                                "0": "name",
                                "1": 4161,
                                "type": "evar"
                              },
                              "type": "eapp"
                            },
                            "1": " = ",
                            "type": ","
                          },
                          "1": {
                            "0": {
                              "0": {
                                "0": "target",
                                "1": 4228,
                                "type": "evar"
                              },
                              "1": ";\\n",
                              "type": ","
                            },
                            "1": {
                              "0": {
                                "0": {
                                  "0": "inner",
                                  "1": 4163,
                                  "type": "evar"
                                },
                                "1": "\\n}",
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
                        "type": "estr"
                      },
                      "type": ","
                    },
                    "1": {
                      "0": {
                        "0": {
                          "0": "pcon",
                          "1": {
                            "0": {
                              "0": "name",
                              "type": "pvar"
                            },
                            "1": {
                              "0": {
                                "0": "args",
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
                          "0": "if (",
                          "1": {
                            "0": {
                              "0": {
                                "0": "target",
                                "1": 4285,
                                "type": "evar"
                              },
                              "1": ".type === \\\"",
                              "type": ","
                            },
                            "1": {
                              "0": {
                                "0": {
                                  "0": "name",
                                  "1": 4287,
                                  "type": "evar"
                                },
                                "1": "\\\") {\\n",
                                "type": ","
                              },
                              "1": {
                                "0": {
                                  "0": {
                                    "0": {
                                      "0": {
                                        "0": {
                                          "0": {
                                            "0": "pat-loop",
                                            "1": 4291,
                                            "type": "evar"
                                          },
                                          "1": {
                                            "0": "target",
                                            "1": 4303,
                                            "type": "evar"
                                          },
                                          "type": "eapp"
                                        },
                                        "1": {
                                          "0": "args",
                                          "1": 4292,
                                          "type": "evar"
                                        },
                                        "type": "eapp"
                                      },
                                      "1": {
                                        "0": {
                                          "0": 0,
                                          "type": "pint"
                                        },
                                        "1": 4293,
                                        "type": "eprim"
                                      },
                                      "type": "eapp"
                                    },
                                    "1": {
                                      "0": "inner",
                                      "1": 4294,
                                      "type": "evar"
                                    },
                                    "type": "eapp"
                                  },
                                  "1": "\\n}",
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
                          "type": "estr"
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
            "type": "ematch"
          },
          "type": "elambda"
        },
        "type": "elambda"
      },
      "type": "elambda"
    },
    "type": "sdef",
    "loc": 4079
  },
  {
    "0": {
      "0": {
        "0": {
          "0": {
            "0": "compile-pat",
            "1": 4217,
            "type": "evar"
          },
          "1": {
            "0": {
              "0": {
                "0": "pcon",
                "1": 4245,
                "type": "evar"
              },
              "1": {
                "0": "cons",
                "1": {
                  "type": "nil"
                },
                "type": "estr"
              },
              "type": "eapp"
            },
            "1": {
              "0": {
                "0": {
                  "0": "cons",
                  "1": 4218,
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": "pprim",
                    "1": 4221,
                    "type": "evar"
                  },
                  "1": {
                    "0": {
                      "0": "pint",
                      "1": 4239,
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": 2,
                        "type": "pint"
                      },
                      "1": 4240,
                      "type": "eprim"
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
                    "1": 4304,
                    "type": "evar"
                  },
                  "1": {
                    "0": {
                      "0": {
                        "0": "pcon",
                        "1": 4305,
                        "type": "evar"
                      },
                      "1": {
                        "0": "lol",
                        "1": {
                          "type": "nil"
                        },
                        "type": "estr"
                      },
                      "type": "eapp"
                    },
                    "1": {
                      "0": {
                        "0": {
                          "0": "cons",
                          "1": 4309,
                          "type": "evar"
                        },
                        "1": {
                          "0": {
                            "0": "pprim",
                            "1": 4310,
                            "type": "evar"
                          },
                          "1": {
                            "0": {
                              "0": "pint",
                              "1": 4312,
                              "type": "evar"
                            },
                            "1": {
                              "0": {
                                "0": 3,
                                "type": "pint"
                              },
                              "1": 4313,
                              "type": "eprim"
                            },
                            "type": "eapp"
                          },
                          "type": "eapp"
                        },
                        "type": "eapp"
                      },
                      "1": {
                        "0": "nil",
                        "1": 4308,
                        "type": "evar"
                      },
                      "type": "eapp"
                    },
                    "type": "eapp"
                  },
                  "type": "eapp"
                },
                "1": {
                  "0": "nil",
                  "1": 4250,
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
        "1": {
          "0": "$target",
          "1": {
            "type": "nil"
          },
          "type": "estr"
        },
        "type": "eapp"
      },
      "1": {
        "0": "lol",
        "1": {
          "type": "nil"
        },
        "type": "estr"
      },
      "type": "eapp"
    },
    "1": 4215,
    "type": "sexpr",
    "loc": 4215
  },
  {
    "0": {
      "0": {
        "0": {
          "0": {
            "0": "compile-pat",
            "1": 4463,
            "type": "evar"
          },
          "1": {
            "0": {
              "0": "pvar",
              "1": 4465,
              "type": "evar"
            },
            "1": {
              "0": "case",
              "1": {
                "type": "nil"
              },
              "type": "estr"
            },
            "type": "eapp"
          },
          "type": "eapp"
        },
        "1": {
          "0": "a",
          "1": {
            "type": "nil"
          },
          "type": "estr"
        },
        "type": "eapp"
      },
      "1": {
        "0": "lol",
        "1": {
          "type": "nil"
        },
        "type": "estr"
      },
      "type": "eapp"
    },
    "1": 4461,
    "type": "sexpr",
    "loc": 4461
  },
  {
    "0": "compile",
    "1": {
      "0": "expr",
      "1": {
        "0": {
          "0": "expr",
          "1": 1748,
          "type": "evar"
        },
        "1": {
          "0": {
            "0": {
              "0": "estr",
              "1": {
                "0": {
                  "0": "first",
                  "type": "pvar"
                },
                "1": {
                  "0": {
                    "0": "tpls",
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
                "0": "tpls",
                "1": 4450,
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
                    "0": "\\\"",
                    "1": {
                      "0": {
                        "0": {
                          "0": {
                            "0": "escape-string",
                            "1": 4456,
                            "type": "evar"
                          },
                          "1": {
                            "0": {
                              "0": "unescapeString",
                              "1": 4458,
                              "type": "evar"
                            },
                            "1": {
                              "0": "first",
                              "1": 4459,
                              "type": "evar"
                            },
                            "type": "eapp"
                          },
                          "type": "eapp"
                        },
                        "1": "\\\"",
                        "type": ","
                      },
                      "1": {
                        "type": "nil"
                      },
                      "type": "cons"
                    },
                    "type": "estr"
                  },
                  "type": ","
                },
                "1": {
                  "0": {
                    "0": {
                      "type": "pany"
                    },
                    "1": {
                      "0": "`",
                      "1": {
                        "0": {
                          "0": {
                            "0": {
                              "0": "escape-string",
                              "1": 4384,
                              "type": "evar"
                            },
                            "1": {
                              "0": {
                                "0": "unescapeString",
                                "1": 4389,
                                "type": "evar"
                              },
                              "1": {
                                "0": "first",
                                "1": 4390,
                                "type": "evar"
                              },
                              "type": "eapp"
                            },
                            "type": "eapp"
                          },
                          "1": "",
                          "type": ","
                        },
                        "1": {
                          "0": {
                            "0": {
                              "0": {
                                "0": {
                                  "0": "join",
                                  "1": 4401,
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
                              "1": {
                                "0": {
                                  "0": {
                                    "0": "map",
                                    "1": 4405,
                                    "type": "evar"
                                  },
                                  "1": {
                                    "0": "tpls",
                                    "1": 4406,
                                    "type": "evar"
                                  },
                                  "type": "eapp"
                                },
                                "1": {
                                  "0": "item",
                                  "1": {
                                    "0": {
                                      "0": "item",
                                      "1": 4423,
                                      "type": "evar"
                                    },
                                    "1": {
                                      "0": {
                                        "0": {
                                          "0": ",",
                                          "1": {
                                            "0": {
                                              "0": "expr",
                                              "type": "pvar"
                                            },
                                            "1": {
                                              "0": {
                                                "0": "suffix",
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
                                          "0": "${",
                                          "1": {
                                            "0": {
                                              "0": {
                                                "0": {
                                                  "0": "compile",
                                                  "1": 4428,
                                                  "type": "evar"
                                                },
                                                "1": {
                                                  "0": "expr",
                                                  "1": 4429,
                                                  "type": "evar"
                                                },
                                                "type": "eapp"
                                              },
                                              "1": "}",
                                              "type": ","
                                            },
                                            "1": {
                                              "0": {
                                                "0": {
                                                  "0": {
                                                    "0": "escape-string",
                                                    "1": 4433,
                                                    "type": "evar"
                                                  },
                                                  "1": {
                                                    "0": {
                                                      "0": "unescape-string",
                                                      "1": 4435,
                                                      "type": "evar"
                                                    },
                                                    "1": {
                                                      "0": "suffix",
                                                      "1": 4430,
                                                      "type": "evar"
                                                    },
                                                    "type": "eapp"
                                                  },
                                                  "type": "eapp"
                                                },
                                                "1": "",
                                                "type": ","
                                              },
                                              "1": {
                                                "type": "nil"
                                              },
                                              "type": "cons"
                                            },
                                            "type": "cons"
                                          },
                                          "type": "estr"
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
                            "1": "`",
                            "type": ","
                          },
                          "1": {
                            "type": "nil"
                          },
                          "type": "cons"
                        },
                        "type": "cons"
                      },
                      "type": "estr"
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
                "0": "eprim",
                "1": {
                  "0": {
                    "0": "prim",
                    "type": "pvar"
                  },
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
                  "1": 1754,
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": {
                      "0": "pstr",
                      "1": {
                        "0": {
                          "0": "string",
                          "type": "pvar"
                        },
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
                        "1": 1759,
                        "type": "evar"
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": "cons",
                            "1": 1761,
                            "type": "evar"
                          },
                          "1": {
                            "0": "\\\"",
                            "1": {
                              "type": "nil"
                            },
                            "type": "estr"
                          },
                          "type": "eapp"
                        },
                        "1": {
                          "0": {
                            "0": {
                              "0": "cons",
                              "1": 3006,
                              "type": "evar"
                            },
                            "1": {
                              "0": {
                                "0": "escape-string",
                                "1": 3410,
                                "type": "evar"
                              },
                              "1": {
                                "0": {
                                  "0": "unescape-string",
                                  "1": 3412,
                                  "type": "evar"
                                },
                                "1": {
                                  "0": "string",
                                  "1": 3426,
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
                                "1": 1770,
                                "type": "evar"
                              },
                              "1": {
                                "0": "\\\"",
                                "1": {
                                  "type": "nil"
                                },
                                "type": "estr"
                              },
                              "type": "eapp"
                            },
                            "1": {
                              "0": "nil",
                              "1": 1760,
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
                          "0": {
                            "0": "int",
                            "type": "pvar"
                          },
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
                          "1": 1776,
                          "type": "evar"
                        },
                        "1": {
                          "0": "int",
                          "1": 1777,
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
                            "0": {
                              "0": "bool",
                              "type": "pvar"
                            },
                            "1": {
                              "type": "nil"
                            },
                            "type": "cons"
                          },
                          "type": "pcon"
                        },
                        "1": {
                          "0": {
                            "0": "bool",
                            "1": 1783,
                            "type": "evar"
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
                                "0": "true",
                                "1": {
                                  "type": "nil"
                                },
                                "type": "estr"
                              },
                              "type": ","
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
                                  "0": "false",
                                  "1": {
                                    "type": "nil"
                                  },
                                  "type": "estr"
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
                    "0": {
                      "0": "name",
                      "type": "pvar"
                    },
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
                    "1": 1792,
                    "type": "evar"
                  },
                  "1": {
                    "0": "name",
                    "1": 1793,
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
                      "0": {
                        "0": "inner",
                        "type": "pvar"
                      },
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
                      "1": 2832,
                      "type": "evar"
                    },
                    "1": {
                      "0": "inner",
                      "1": 2834,
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
                        "0": {
                          "0": "name",
                          "type": "pvar"
                        },
                        "1": {
                          "0": {
                            "0": "body",
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
                        "0": "++",
                        "1": 1799,
                        "type": "evar"
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": "cons",
                            "1": 1801,
                            "type": "evar"
                          },
                          "1": {
                            "0": "(",
                            "1": {
                              "type": "nil"
                            },
                            "type": "estr"
                          },
                          "type": "eapp"
                        },
                        "1": {
                          "0": {
                            "0": {
                              "0": "cons",
                              "1": 1803,
                              "type": "evar"
                            },
                            "1": {
                              "0": {
                                "0": "sanitize",
                                "1": 1804,
                                "type": "evar"
                              },
                              "1": {
                                "0": "name",
                                "1": 1805,
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
                                "1": 1806,
                                "type": "evar"
                              },
                              "1": {
                                "0": ") => ",
                                "1": {
                                  "type": "nil"
                                },
                                "type": "estr"
                              },
                              "type": "eapp"
                            },
                            "1": {
                              "0": {
                                "0": {
                                  "0": "cons",
                                  "1": 1808,
                                  "type": "evar"
                                },
                                "1": {
                                  "0": {
                                    "0": "compile",
                                    "1": 1809,
                                    "type": "evar"
                                  },
                                  "1": {
                                    "0": "body",
                                    "1": 1810,
                                    "type": "evar"
                                  },
                                  "type": "eapp"
                                },
                                "type": "eapp"
                              },
                              "1": {
                                "0": "nil",
                                "1": 1800,
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
                          "0": {
                            "0": "name",
                            "type": "pvar"
                          },
                          "1": {
                            "0": {
                              "0": "init",
                              "type": "pvar"
                            },
                            "1": {
                              "0": {
                                "0": "body",
                                "type": "pvar"
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
                        "type": "pcon"
                      },
                      "1": {
                        "0": {
                          "0": "++",
                          "1": 1817,
                          "type": "evar"
                        },
                        "1": {
                          "0": {
                            "0": {
                              "0": "cons",
                              "1": 1819,
                              "type": "evar"
                            },
                            "1": {
                              "0": "((",
                              "1": {
                                "type": "nil"
                              },
                              "type": "estr"
                            },
                            "type": "eapp"
                          },
                          "1": {
                            "0": {
                              "0": {
                                "0": "cons",
                                "1": 1821,
                                "type": "evar"
                              },
                              "1": {
                                "0": {
                                  "0": "sanitize",
                                  "1": 1822,
                                  "type": "evar"
                                },
                                "1": {
                                  "0": "name",
                                  "1": 1823,
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
                                  "1": 1824,
                                  "type": "evar"
                                },
                                "1": {
                                  "0": ") => ",
                                  "1": {
                                    "type": "nil"
                                  },
                                  "type": "estr"
                                },
                                "type": "eapp"
                              },
                              "1": {
                                "0": {
                                  "0": {
                                    "0": "cons",
                                    "1": 1826,
                                    "type": "evar"
                                  },
                                  "1": {
                                    "0": {
                                      "0": "compile",
                                      "1": 1827,
                                      "type": "evar"
                                    },
                                    "1": {
                                      "0": "body",
                                      "1": 1828,
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
                                      "1": 1829,
                                      "type": "evar"
                                    },
                                    "1": {
                                      "0": ")(",
                                      "1": {
                                        "type": "nil"
                                      },
                                      "type": "estr"
                                    },
                                    "type": "eapp"
                                  },
                                  "1": {
                                    "0": {
                                      "0": {
                                        "0": "cons",
                                        "1": 1831,
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": {
                                          "0": "compile",
                                          "1": 1832,
                                          "type": "evar"
                                        },
                                        "1": {
                                          "0": "init",
                                          "1": 1833,
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
                                          "1": 1834,
                                          "type": "evar"
                                        },
                                        "1": {
                                          "0": ")",
                                          "1": {
                                            "type": "nil"
                                          },
                                          "type": "estr"
                                        },
                                        "type": "eapp"
                                      },
                                      "1": {
                                        "0": "nil",
                                        "1": 1818,
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
                            "0": {
                              "0": "fn",
                              "type": "pvar"
                            },
                            "1": {
                              "0": {
                                "0": "arg",
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
                            "0": "fn",
                            "1": 1842,
                            "type": "evar"
                          },
                          "1": {
                            "0": {
                              "0": {
                                "0": "elambda",
                                "1": {
                                  "0": {
                                    "0": "name",
                                    "type": "pvar"
                                  },
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
                                  "1": 1847,
                                  "type": "evar"
                                },
                                "1": {
                                  "0": {
                                    "0": {
                                      "0": "cons",
                                      "1": 1849,
                                      "type": "evar"
                                    },
                                    "1": {
                                      "0": "(",
                                      "1": {
                                        "type": "nil"
                                      },
                                      "type": "estr"
                                    },
                                    "type": "eapp"
                                  },
                                  "1": {
                                    "0": {
                                      "0": {
                                        "0": "cons",
                                        "1": 1851,
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": {
                                          "0": "compile",
                                          "1": 1852,
                                          "type": "evar"
                                        },
                                        "1": {
                                          "0": "fn",
                                          "1": 1853,
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
                                          "1": 1854,
                                          "type": "evar"
                                        },
                                        "1": {
                                          "0": ")(",
                                          "1": {
                                            "type": "nil"
                                          },
                                          "type": "estr"
                                        },
                                        "type": "eapp"
                                      },
                                      "1": {
                                        "0": {
                                          "0": {
                                            "0": "cons",
                                            "1": 1856,
                                            "type": "evar"
                                          },
                                          "1": {
                                            "0": {
                                              "0": "compile",
                                              "1": 1857,
                                              "type": "evar"
                                            },
                                            "1": {
                                              "0": "arg",
                                              "1": 1858,
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
                                              "1": 1859,
                                              "type": "evar"
                                            },
                                            "1": {
                                              "0": ")",
                                              "1": {
                                                "type": "nil"
                                              },
                                              "type": "estr"
                                            },
                                            "type": "eapp"
                                          },
                                          "1": {
                                            "0": "nil",
                                            "1": 1848,
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
                                    "1": 1863,
                                    "type": "evar"
                                  },
                                  "1": {
                                    "0": {
                                      "0": {
                                        "0": "cons",
                                        "1": 1865,
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": {
                                          "0": "compile",
                                          "1": 1866,
                                          "type": "evar"
                                        },
                                        "1": {
                                          "0": "fn",
                                          "1": 1867,
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
                                          "1": 1868,
                                          "type": "evar"
                                        },
                                        "1": {
                                          "0": "(",
                                          "1": {
                                            "type": "nil"
                                          },
                                          "type": "estr"
                                        },
                                        "type": "eapp"
                                      },
                                      "1": {
                                        "0": {
                                          "0": {
                                            "0": "cons",
                                            "1": 1870,
                                            "type": "evar"
                                          },
                                          "1": {
                                            "0": {
                                              "0": "compile",
                                              "1": 1871,
                                              "type": "evar"
                                            },
                                            "1": {
                                              "0": "arg",
                                              "1": 1872,
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
                                              "1": 1873,
                                              "type": "evar"
                                            },
                                            "1": {
                                              "0": ")",
                                              "1": {
                                                "type": "nil"
                                              },
                                              "type": "estr"
                                            },
                                            "type": "eapp"
                                          },
                                          "1": {
                                            "0": "nil",
                                            "1": 1864,
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
                              "0": {
                                "0": "target",
                                "type": "pvar"
                              },
                              "1": {
                                "0": {
                                  "0": "cases",
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
                            "0": "(($target) => {",
                            "1": {
                              "0": {
                                "0": {
                                  "0": {
                                    "0": {
                                      "0": "join",
                                      "1": 4363,
                                      "type": "evar"
                                    },
                                    "1": {
                                      "0": "\\n",
                                      "1": {
                                        "type": "nil"
                                      },
                                      "type": "estr"
                                    },
                                    "type": "eapp"
                                  },
                                  "1": {
                                    "0": {
                                      "0": {
                                        "0": "map",
                                        "1": 4325,
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": "cases",
                                        "1": 4326,
                                        "type": "evar"
                                      },
                                      "type": "eapp"
                                    },
                                    "1": {
                                      "0": "case",
                                      "1": {
                                        "0": {
                                          "0": "case",
                                          "1": 4349,
                                          "type": "evar"
                                        },
                                        "1": {
                                          "0": {
                                            "0": {
                                              "0": ",",
                                              "1": {
                                                "0": {
                                                  "0": "pat",
                                                  "type": "pvar"
                                                },
                                                "1": {
                                                  "0": {
                                                    "0": "body",
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
                                                  "0": {
                                                    "0": "compile-pat",
                                                    "1": 4352,
                                                    "type": "evar"
                                                  },
                                                  "1": {
                                                    "0": "pat",
                                                    "1": 4353,
                                                    "type": "evar"
                                                  },
                                                  "type": "eapp"
                                                },
                                                "1": {
                                                  "0": "$target",
                                                  "1": {
                                                    "type": "nil"
                                                  },
                                                  "type": "estr"
                                                },
                                                "type": "eapp"
                                              },
                                              "1": {
                                                "0": "return ",
                                                "1": {
                                                  "0": {
                                                    "0": {
                                                      "0": {
                                                        "0": "compile",
                                                        "1": 4360,
                                                        "type": "evar"
                                                      },
                                                      "1": {
                                                        "0": "body",
                                                        "1": 4361,
                                                        "type": "evar"
                                                      },
                                                      "type": "eapp"
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
                                "1": "\\nthrow new Error('Failed to match. ' + valueToString($target))})(",
                                "type": ","
                              },
                              "1": {
                                "0": {
                                  "0": {
                                    "0": {
                                      "0": "compile",
                                      "1": 4321,
                                      "type": "evar"
                                    },
                                    "1": {
                                      "0": "target",
                                      "1": 4322,
                                      "type": "evar"
                                    },
                                    "type": "eapp"
                                  },
                                  "1": ")",
                                  "type": ","
                                },
                                "1": {
                                  "type": "nil"
                                },
                                "type": "cons"
                              },
                              "type": "cons"
                            },
                            "type": "estr"
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
          "1": 3666,
          "type": "evar"
        },
        "1": {
          "0": {
            "0": "compile",
            "1": 3668,
            "type": "evar"
          },
          "1": {
            "0": "v",
            "1": 3669,
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
      "0": "\\\"",
      "1": {
        "type": "nil"
      },
      "type": "estr"
    },
    "1": 4570,
    "type": "sexpr",
    "loc": 4570
  },
  {
    "0": {
      "0": "\\n",
      "1": {
        "type": "nil"
      },
      "type": "estr"
    },
    "1": 4579,
    "type": "sexpr",
    "loc": 4579
  },
  {
    "0": {
      "0": "\\\\n",
      "1": {
        "type": "nil"
      },
      "type": "estr"
    },
    "1": 4573,
    "type": "sexpr",
    "loc": 4573
  },
  {
    "0": {
      "0": "\\\\\\n",
      "1": {
        "type": "nil"
      },
      "type": "estr"
    },
    "1": 4576,
    "type": "sexpr",
    "loc": 4576
  },
  {
    "0": {
      "0": {
        "0": {
          "0": ",",
          "1": 3571,
          "type": "evar"
        },
        "1": {
          "0": "run",
          "1": 3572,
          "type": "evar"
        },
        "type": "eapp"
      },
      "1": {
        "0": {
          "0": {
            "0": "cons",
            "1": 3574,
            "type": "evar"
          },
          "1": {
            "0": {
              "0": {
                "0": ",",
                "1": 3575,
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": {
                    "0": 1,
                    "type": "pint"
                  },
                  "1": 3578,
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
              "1": 3579,
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
              "1": 3582,
              "type": "evar"
            },
            "1": {
              "0": {
                "0": {
                  "0": ",",
                  "1": 3585,
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": "hello",
                    "1": {
                      "type": "nil"
                    },
                    "type": "estr"
                  },
                  "type": "equot"
                },
                "type": "eapp"
              },
              "1": {
                "0": "hello",
                "1": {
                  "type": "nil"
                },
                "type": "estr"
              },
              "type": "eapp"
            },
            "type": "eapp"
          },
          "1": {
            "0": {
              "0": {
                "0": "cons",
                "1": 4391,
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": {
                    "0": ",",
                    "1": 4392,
                    "type": "evar"
                  },
                  "1": {
                    "0": {
                      "0": "\\\"",
                      "1": {
                        "type": "nil"
                      },
                      "type": "estr"
                    },
                    "type": "equot"
                  },
                  "type": "eapp"
                },
                "1": {
                  "0": "\\\"",
                  "1": {
                    "type": "nil"
                  },
                  "type": "estr"
                },
                "type": "eapp"
              },
              "type": "eapp"
            },
            "1": {
              "0": {
                "0": {
                  "0": "cons",
                  "1": 4510,
                  "type": "evar"
                },
                "1": {
                  "0": {
                    "0": {
                      "0": ",",
                      "1": 4511,
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": "\\n",
                        "1": {
                          "type": "nil"
                        },
                        "type": "estr"
                      },
                      "type": "equot"
                    },
                    "type": "eapp"
                  },
                  "1": {
                    "0": "\\n",
                    "1": {
                      "type": "nil"
                    },
                    "type": "estr"
                  },
                  "type": "eapp"
                },
                "type": "eapp"
              },
              "1": {
                "0": {
                  "0": {
                    "0": "cons",
                    "1": 4518,
                    "type": "evar"
                  },
                  "1": {
                    "0": {
                      "0": {
                        "0": ",",
                        "1": 4519,
                        "type": "evar"
                      },
                      "1": {
                        "0": {
                          "0": "\\\\n",
                          "1": {
                            "type": "nil"
                          },
                          "type": "estr"
                        },
                        "type": "equot"
                      },
                      "type": "eapp"
                    },
                    "1": {
                      "0": "\\\\n",
                      "1": {
                        "type": "nil"
                      },
                      "type": "estr"
                    },
                    "type": "eapp"
                  },
                  "type": "eapp"
                },
                "1": {
                  "0": {
                    "0": {
                      "0": "cons",
                      "1": 4582,
                      "type": "evar"
                    },
                    "1": {
                      "0": {
                        "0": {
                          "0": ",",
                          "1": 4583,
                          "type": "evar"
                        },
                        "1": {
                          "0": {
                            "0": "\\\\\\n",
                            "1": {
                              "type": "nil"
                            },
                            "type": "estr"
                          },
                          "type": "equot"
                        },
                        "type": "eapp"
                      },
                      "1": {
                        "0": "\\\\\\n",
                        "1": {
                          "type": "nil"
                        },
                        "type": "estr"
                      },
                      "type": "eapp"
                    },
                    "type": "eapp"
                  },
                  "1": {
                    "0": {
                      "0": {
                        "0": "cons",
                        "1": 4555,
                        "type": "evar"
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": ",",
                            "1": 4556,
                            "type": "evar"
                          },
                          "1": {
                            "0": {
                              "0": "\\\\\"",
                              "1": {
                                "type": "nil"
                              },
                              "type": "estr"
                            },
                            "type": "equot"
                          },
                          "type": "eapp"
                        },
                        "1": {
                          "0": "\\\\\"",
                          "1": {
                            "type": "nil"
                          },
                          "type": "estr"
                        },
                        "type": "eapp"
                      },
                      "type": "eapp"
                    },
                    "1": {
                      "0": {
                        "0": {
                          "0": "cons",
                          "1": 4563,
                          "type": "evar"
                        },
                        "1": {
                          "0": {
                            "0": {
                              "0": ",",
                              "1": 4564,
                              "type": "evar"
                            },
                            "1": {
                              "0": {
                                "0": "\\\\'",
                                "1": {
                                  "type": "nil"
                                },
                                "type": "estr"
                              },
                              "type": "equot"
                            },
                            "type": "eapp"
                          },
                          "1": {
                            "0": "\\\\'",
                            "1": {
                              "type": "nil"
                            },
                            "type": "estr"
                          },
                          "type": "eapp"
                        },
                        "type": "eapp"
                      },
                      "1": {
                        "0": {
                          "0": {
                            "0": "cons",
                            "1": 3592,
                            "type": "evar"
                          },
                          "1": {
                            "0": {
                              "0": {
                                "0": ",",
                                "1": 3593,
                                "type": "evar"
                              },
                              "1": {
                                "0": {
                                  "0": {
                                    "0": {
                                      "0": "+",
                                      "1": 3597,
                                      "type": "evar"
                                    },
                                    "1": {
                                      "0": {
                                        "0": 2,
                                        "type": "pint"
                                      },
                                      "1": 3598,
                                      "type": "eprim"
                                    },
                                    "type": "eapp"
                                  },
                                  "1": {
                                    "0": {
                                      "0": 3,
                                      "type": "pint"
                                    },
                                    "1": 3599,
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
                              "1": 3600,
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
                              "1": 3602,
                              "type": "evar"
                            },
                            "1": {
                              "0": {
                                "0": {
                                  "0": ",",
                                  "1": 3603,
                                  "type": "evar"
                                },
                                "1": {
                                  "0": {
                                    "0": {
                                      "0": "pany",
                                      "1": 3671,
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
                                          "0": "any",
                                          "1": {
                                            "type": "nil"
                                          },
                                          "type": "estr"
                                        },
                                        "type": ","
                                      },
                                      "1": {
                                        "0": {
                                          "0": {
                                            "0": "pvar",
                                            "1": {
                                              "0": {
                                                "0": "name",
                                                "type": "pvar"
                                              },
                                              "1": {
                                                "type": "nil"
                                              },
                                              "type": "cons"
                                            },
                                            "type": "pcon"
                                          },
                                          "1": {
                                            "0": "name",
                                            "1": 3615,
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
                                "0": "any",
                                "1": {
                                  "type": "nil"
                                },
                                "type": "estr"
                              },
                              "type": "eapp"
                            },
                            "type": "eapp"
                          },
                          "1": {
                            "0": {
                              "0": {
                                "0": "cons",
                                "1": 4436,
                                "type": "evar"
                              },
                              "1": {
                                "0": {
                                  "0": {
                                    "0": ",",
                                    "1": 4437,
                                    "type": "evar"
                                  },
                                  "1": {
                                    "0": {
                                      "0": "a",
                                      "1": {
                                        "0": {
                                          "0": {
                                            "0": {
                                              "0": 2,
                                              "type": "pint"
                                            },
                                            "1": 4443,
                                            "type": "eprim"
                                          },
                                          "1": "b",
                                          "type": ","
                                        },
                                        "1": {
                                          "type": "nil"
                                        },
                                        "type": "cons"
                                      },
                                      "type": "estr"
                                    },
                                    "type": "equot"
                                  },
                                  "type": "eapp"
                                },
                                "1": {
                                  "0": "a2b",
                                  "1": {
                                    "type": "nil"
                                  },
                                  "type": "estr"
                                },
                                "type": "eapp"
                              },
                              "type": "eapp"
                            },
                            "1": {
                              "0": {
                                "0": {
                                  "0": "cons",
                                  "1": 3674,
                                  "type": "evar"
                                },
                                "1": {
                                  "0": {
                                    "0": {
                                      "0": ",",
                                      "1": 3675,
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
                                                "1": 3685,
                                                "type": "evar"
                                              },
                                              "1": {
                                                "0": "a",
                                                "1": 3686,
                                                "type": "evar"
                                              },
                                              "type": "eapp"
                                            },
                                            "1": {
                                              "0": {
                                                "0": 2,
                                                "type": "pint"
                                              },
                                              "1": 3687,
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
                                          "1": 3688,
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
                                    "1": 3677,
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
                                    "1": 3689,
                                    "type": "evar"
                                  },
                                  "1": {
                                    "0": {
                                      "0": {
                                        "0": ",",
                                        "1": 3690,
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
                                            "1": 3698,
                                            "type": "eprim"
                                          },
                                          "2": {
                                            "0": "two",
                                            "1": {
                                              "0": {
                                                "0": 2,
                                                "type": "pint"
                                              },
                                              "1": 3700,
                                              "type": "eprim"
                                            },
                                            "2": {
                                              "0": {
                                                "0": {
                                                  "0": "+",
                                                  "1": 3702,
                                                  "type": "evar"
                                                },
                                                "1": {
                                                  "0": {
                                                    "0": 1,
                                                    "type": "pint"
                                                  },
                                                  "1": 3703,
                                                  "type": "eprim"
                                                },
                                                "type": "eapp"
                                              },
                                              "1": {
                                                "0": {
                                                  "0": 2,
                                                  "type": "pint"
                                                },
                                                "1": 3704,
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
                                      "1": 3692,
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
                                      "1": 3899,
                                      "type": "evar"
                                    },
                                    "1": {
                                      "0": {
                                        "0": {
                                          "0": ",",
                                          "1": 3900,
                                          "type": "evar"
                                        },
                                        "1": {
                                          "0": {
                                            "0": {
                                              "0": {
                                                "0": 2,
                                                "type": "pint"
                                              },
                                              "1": 3906,
                                              "type": "eprim"
                                            },
                                            "1": {
                                              "0": {
                                                "0": {
                                                  "0": {
                                                    "0": 2,
                                                    "type": "pint"
                                                  },
                                                  "type": "pprim"
                                                },
                                                "1": {
                                                  "0": {
                                                    "0": 1,
                                                    "type": "pint"
                                                  },
                                                  "1": 3908,
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
                                        "1": 3902,
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
                                        "1": 3914,
                                        "type": "evar"
                                      },
                                      "1": {
                                        "0": {
                                          "0": {
                                            "0": ",",
                                            "1": 3915,
                                            "type": "evar"
                                          },
                                          "1": {
                                            "0": {
                                              "0": "a/b",
                                              "1": {
                                                "0": {
                                                  "0": 2,
                                                  "type": "pint"
                                                },
                                                "1": 3930,
                                                "type": "eprim"
                                              },
                                              "2": {
                                                "0": "a/b",
                                                "1": 3931,
                                                "type": "evar"
                                              },
                                              "type": "elet"
                                            },
                                            "type": "equot"
                                          },
                                          "type": "eapp"
                                        },
                                        "1": {
                                          "0": {
                                            "0": 2,
                                            "type": "pint"
                                          },
                                          "1": 3917,
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
                                          "1": 4004,
                                          "type": "evar"
                                        },
                                        "1": {
                                          "0": {
                                            "0": {
                                              "0": ",",
                                              "1": 4005,
                                              "type": "evar"
                                            },
                                            "1": {
                                              "0": {
                                                "0": {
                                                  "0": {
                                                    "0": true,
                                                    "type": "pbool"
                                                  },
                                                  "1": 4013,
                                                  "type": "eprim"
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
                                                        "0": 1,
                                                        "type": "pint"
                                                      },
                                                      "1": 4015,
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
                                            "1": 4007,
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
                                            "1": 4486,
                                            "type": "evar"
                                          },
                                          "1": {
                                            "0": {
                                              "0": {
                                                "0": ",",
                                                "1": 4487,
                                                "type": "evar"
                                              },
                                              "1": {
                                                "0": {
                                                  "0": "`",
                                                  "1": {
                                                    "0": {
                                                      "0": {
                                                        "0": {
                                                          "0": 1,
                                                          "type": "pint"
                                                        },
                                                        "1": 4493,
                                                        "type": "eprim"
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
                                                "type": "equot"
                                              },
                                              "type": "eapp"
                                            },
                                            "1": {
                                              "0": "`1",
                                              "1": {
                                                "type": "nil"
                                              },
                                              "type": "estr"
                                            },
                                            "type": "eapp"
                                          },
                                          "type": "eapp"
                                        },
                                        "1": {
                                          "0": {
                                            "0": {
                                              "0": "cons",
                                              "1": 4496,
                                              "type": "evar"
                                            },
                                            "1": {
                                              "0": {
                                                "0": {
                                                  "0": ",",
                                                  "1": 4497,
                                                  "type": "evar"
                                                },
                                                "1": {
                                                  "0": {
                                                    "0": "${",
                                                    "1": {
                                                      "0": {
                                                        "0": {
                                                          "0": {
                                                            "0": 1,
                                                            "type": "pint"
                                                          },
                                                          "1": 4503,
                                                          "type": "eprim"
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
                                                  "type": "equot"
                                                },
                                                "type": "eapp"
                                              },
                                              "1": {
                                                "0": "${1",
                                                "1": {
                                                  "type": "nil"
                                                },
                                                "type": "estr"
                                              },
                                              "type": "eapp"
                                            },
                                            "type": "eapp"
                                          },
                                          "1": {
                                            "0": "nil",
                                            "1": 3573,
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
    "1": 3569,
    "type": "sexpr",
    "loc": 3569
  },
  {
    "0": {
      "0": {
        "0": "eval",
        "1": 3633,
        "type": "evar"
      },
      "1": {
        "0": {
          "0": "compile",
          "1": 3635,
          "type": "evar"
        },
        "1": {
          "0": {
            "0": {
              "0": {
                "0": "+",
                "1": 3644,
                "type": "evar"
              },
              "1": {
                "0": {
                  "0": 2,
                  "type": "pint"
                },
                "1": 3645,
                "type": "eprim"
              },
              "type": "eapp"
            },
            "1": {
              "0": {
                "0": 3,
                "type": "pint"
              },
              "1": 3647,
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
    "1": 3631,
    "type": "sexpr",
    "loc": 3631
  },
  {
    "0": {
      "0": {
        "0": {
          "0": ",",
          "1": 4506,
          "type": "evar"
        },
        "1": {
          "0": {
            "0": "1",
            "1": 4509,
            "type": "cst/identifier"
          },
          "type": "equot"
        },
        "type": "eapp"
      },
      "1": {
        "0": {
          "0": 42,
          "type": "pint"
        },
        "1": 4506,
        "type": "eprim"
      },
      "type": "eapp"
    },
    "1": 4506,
    "type": "sexpr",
    "loc": 4506
  },
  {
    "0": {
      "0": {
        "0": 1,
        "type": "pint"
      },
      "1": 4077,
      "type": "eprim"
    },
    "1": 4077,
    "type": "sexpr",
    "loc": 4077
  }
]}