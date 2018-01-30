import React from 'react'
import { createContext } from 'react-broadcast'

export const context = (targets, mapContextToProps) => Wrapped => props => {
    const isArray = Array.isArray(targets)
    const array = isArray ? targets : [targets]
    const values = []
    return [...array, Wrapped].reduceRight((accumulator, Context) => (
        <Context.Consumer>
            {value => {
                isArray && values.push(value)
                return accumulator !== Wrapped ? (
                    accumulator
                ) : (
                    <Wrapped {...props} {...mapContextToProps(isArray ? values : value, props)} />
                )
            }}
        </Context.Consumer>
    ))
}

class RenderOnce extends React.Component {
    shouldComponentUpdate() {
        return false
    }
    render() {
        return this.props.children
    }
}

export const StoreContext = React.createContext({})
export class StoreProvider extends React.Component {
    constructor(props) {
        super()
        this.state = props.initialState || {}
        this.actions = Object.keys(props.actions).reduce(
            (acc, name) => ({
                ...acc,
                [name]: (...args) => {
                    const result = props.actions[name](...args)
                    this.setState(typeof result === 'function' ? result(this.state) : result)
                },
            }),
            {},
        )
    }
    render() {
        const value = { state: this.state, actions: this.actions }
        return (
            <StoreContext.Provider value={value}>
                <RenderOnce children={this.props.children} />
            </StoreContext.Provider>
        )
    }
}
