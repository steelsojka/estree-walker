/* @flow */

import defaults from 'lodash.defaults';
import recurseTree from 'recurserator/recurseTree';

export default class ESTreeRunner {
  constructor(options: Object = {}) {
    this.options = defaults(options, {
      parentKey: Symbol()
    });
  }

  * run(startNode: Object, yieldFilter?: Function, recursionFilter?: Function): Iterator {
    yieldFilter = yieldFilter || ESTreeRunner.isNode;
    recursionFilter = recursionFilter || ESTreeRunner.isNode;

    for (let [key, node, path, parent] of recurseTree(startNode, yieldFilter, recursionFilter)) {
      if (this.parentKey !== null) {
        Reflect.defineProperty(node, this.parentKey, { value: parent });
      }

      yield node;
    }
  }

  * runUntil(filter: Function, startNode: Object): Iterator {
    for (let [key, node, path, parent] of recurseTree(startNode, ESTreeRunner.isNode, ESTreeRunner.isNode)) {
      if (filter(node, parent)) {
        yield node;
        break;
      }
    }
  }

  * runUntilType(type: string, startNode: Object): Iterator {
    yield* this.runUntil((node: Object) => node.type === type, startNode);
  }

  static isNode(node: Object) {
    return !!node && typeof node === 'object' && typeof node.type === 'string';
  }
}
