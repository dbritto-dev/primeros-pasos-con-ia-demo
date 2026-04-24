import { useRef, useSyncExternalStore } from "react";
import { createStore, type StoreApi } from "zustand/vanilla";
import { combine as infer } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { mails, models, systemPrompt } from "./data";

const defaultCompare = shallow;

const appStore = createStore(
  infer(
    {
      modelId: models[0].id,
      mailId: -1,
      mailsFilter: "",
      systemPrompt,
      models,
      mails,
    },
    () => ({}),
  ),
);

function useSelectorWithCompare<T, U>(
  selector: (state: T) => U,
  compare: (a: U, b: U) => boolean,
): (state: T) => U {
  const previous = useRef<U>(undefined);
  return (state) => {
    const next = selector(state);
    return previous.current && compare(previous.current, next)
      ? previous.current
      : (previous.current = next);
  };
}

function useSelector<T, U>(
  store: StoreApi<T>,
  selector: (state: T) => U,
  compare: (a: U, b: U) => boolean = defaultCompare,
) {
  const selectorWithCompare = useSelectorWithCompare(selector, compare);
  return useSyncExternalStore(
    store.subscribe,
    () => selectorWithCompare(store.getState()),
    () => selector(store.getInitialState()),
  );
}

export { appStore, useSelector };
