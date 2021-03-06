// @flow

import React from 'react';

import type {Node} from 'react';
import type {DependencyContext} from '../../type-definitions';

type ProviderProps = {
    deps: DependencyContext,
    children: Node
}

const dummy: any = {};
const defaultContext: DependencyContext = dummy;

const Context = React.createContext<DependencyContext>(defaultContext);

export const DependencyContextProvider = (props: ProviderProps) => {
    return (
        <Context.Provider value={props.deps}>
            {props.children}
        </Context.Provider>
    );
};

export const DependencyContextConsumer = Context.Consumer;
