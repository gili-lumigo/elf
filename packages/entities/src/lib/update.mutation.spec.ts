import {
  createEntitiesStore,
  createTodo,
  createUIEntityStore,
  createUITodo,
  Todo,
  toMatchSnapshot,
} from '@ngneat/elf-mocks';
import { addEntities } from './add.mutation';
import {
  updateAllEntities,
  updateEntities,
  updateEntitiesByPredicate,
  upsertEntities,
} from './update.mutation';
import { UIEntitiesRef } from './entity.state';

describe('update', () => {
  let store: ReturnType<typeof createEntitiesStore>;

  beforeEach(() => {
    store = createEntitiesStore();
  });

  it('should update one entity', () => {
    store.reduce(addEntities(createTodo(1)));
    toMatchSnapshot(expect, store, 'completed false');
    store.reduce(updateEntities(1, { completed: true }));
    toMatchSnapshot(expect, store, 'completed true');
  });

  it('should update multiple entities', () => {
    store.reduce(addEntities([createTodo(1), createTodo(2)]));
    toMatchSnapshot(expect, store, 'multi completed false');
    store.reduce(updateEntities([1, 2], { completed: true }));
    toMatchSnapshot(expect, store, 'multi completed true');
  });

  it('should update by callback', () => {
    store.reduce(addEntities(createTodo(1)));
    toMatchSnapshot(expect, store, 'completed false');
    store.reduce(
      updateEntities(1, (todo) => ({ ...todo, completed: !todo.completed }))
    );
    toMatchSnapshot(expect, store, 'completed true');
  });

  it('should update by predicate', () => {
    store.reduce(addEntities([createTodo(1), createTodo(2)]));
    toMatchSnapshot(expect, store, 'completed false');
    store.reduce(
      updateEntitiesByPredicate((entity) => entity.id === 1, {
        completed: true,
      })
    );
    toMatchSnapshot(expect, store, 'completed true');
  });

  it('should update all', () => {
    store.reduce(addEntities([createTodo(1), createTodo(2)]));
    toMatchSnapshot(expect, store, 'completed false');
    store.reduce(updateAllEntities({ completed: true }));
    toMatchSnapshot(expect, store, 'completed true');
  });

  it('should work with ref', () => {
    const store = createUIEntityStore();
    store.reduce(
      addEntities([createUITodo(1), createUITodo(2)], { ref: UIEntitiesRef })
    );
    toMatchSnapshot(expect, store, 'open false');
    store.reduce(updateEntities(1, { open: true }, { ref: UIEntitiesRef }));
    toMatchSnapshot(expect, store, 'open true');
  });

  it('should work with ref update all', () => {
    const store = createUIEntityStore();
    store.reduce(
      addEntities([createUITodo(1), createUITodo(2)], { ref: UIEntitiesRef })
    );
    toMatchSnapshot(expect, store, 'open false');
    store.reduce(updateAllEntities({ open: true }, { ref: UIEntitiesRef }));
    toMatchSnapshot(expect, store, 'open true');
  });

  describe('Upsert', () => {
    const updater = (e: Todo) => ({ ...e, title: 'elf' });
    const creator = (id: number) => createTodo(id);
    const options = {
      updater,
      creator,
    };

    it(`should add the entity if it doesn't exists`, () => {
      const store = createEntitiesStore();
      store.reduce(addEntities([createTodo(1)]));
      toMatchSnapshot(expect, store, 'one entity');
      store.reduce(upsertEntities(2, options));
      toMatchSnapshot(expect, store, 'two entities');
    });

    it('should update an entity if exists', () => {
      const store = createEntitiesStore();
      store.reduce(addEntities([createTodo(1)]));
      toMatchSnapshot(expect, store, 'one entity, title "todo 1"');
      store.reduce(upsertEntities(1, options));
      toMatchSnapshot(expect, store, 'one entity, title "elf"');
    });

    it('should update add the missing entities and update existing', () => {
      const store = createEntitiesStore();
      store.reduce(addEntities([createTodo(1)]));
      toMatchSnapshot(expect, store, 'one entity, title "todo 1"');
      store.reduce(upsertEntities([1, 2], options));
      toMatchSnapshot(
        expect,
        store,
        'two entities, 1: title "elf", 2: title "todo 2"'
      );
    });

    it('should merge updater with creator', () => {
      const store = createEntitiesStore();
      store.reduce(addEntities([createTodo(1)]));
      toMatchSnapshot(expect, store, 'one entity, title "todo 1"');
      store.reduce(
        upsertEntities([1, 2], { ...options, mergeUpdaterWithCreator: true })
      );
      toMatchSnapshot(expect, store, 'two entities, title "elf"');
    });

    it('should work with ref', () => {
      const store = createUIEntityStore();
      store.reduce(addEntities([createUITodo(1)], { ref: UIEntitiesRef }));
      toMatchSnapshot(expect, store, 'one entity, open false');
      store.reduce(
        upsertEntities([1, 2], {
          updater: (e) => ({ ...e, open: false }),
          creator: (id) => createUITodo(id),
          mergeUpdaterWithCreator: true,
          ref: UIEntitiesRef,
        })
      );
      toMatchSnapshot(expect, store, 'two entities, open true');
    });
  });
});
