import { extract } from '../../../../../src/operations/extract';
import { Serializeable } from '../../../../../src/primitive';
import { StaticNodeId } from '../../../../../src/schema';
import { createSnapshot } from '../../../../helpers';

const { QueryRoot: QueryRootId } = StaticNodeId;

describe.skip(`operations.serialization`, () => {
  describe(`new array of values hanging off of a root`, () => {

    let extractResult: Serializeable.GraphSnapshot;
    beforeAll(() => {
      const snapshot = createSnapshot(
        {
          viewer: [
            {
              postal: 123,
              name: 'Gouda',
            },
            {
              postal: 456,
              name: 'Brie',
            },
          ],
        },
        `{ viewer { postal name } }`
      ).snapshot;

      extractResult = extract(snapshot);
    });

    it(`extract Json serializable object`, () => {
      expect(extractResult).to.deep.eq({
        [QueryRootId]: {
          outbound: null,
          inbound: null,
          data: {
            viewer: [
              {
                postal: 123,
                name: 'Gouda',
              },
              {
                postal: 456,
                name: 'Brie',
              },
            ],
          },
        },
      });
    });

  });
});
