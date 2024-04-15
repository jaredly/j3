//

type Message =
    | {
          type: 'init';
          evaluators: string[];
      }
    | {
          type: 'cache';
          url: string;
      }
    | {
          type: 'checknstuff';
          whatsit: string;
      }
    | {
          type: 'update';
          state: 'whatttt';
      };

// so ...
// does this mean I'll be maintaining ... a parallel ... state ... something?
// naw, I want to send over ... the nodes. I think.

onmessage = (message) => {
    const data = JSON.parse(message.data);
    // switch (data.type) {
    // }
};

// postMessage
