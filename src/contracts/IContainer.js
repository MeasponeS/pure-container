'use strict';
import RegisterContext from './RegisterContext';
import {
    isFunction,
    isArray,
    each
} from 'underscore';
/**
 * @interface IContainer 容器接口
 * @type {Array}
 */
export default class IContainer {
    #instances = {};
    #bindings = {};
    #aliases = {};
    #methodBindings = {};
    constructor() {}

    /**
     * [注册一个现成的对象实例为单例]
     * @param  {string} name     [description]
     * @param  {any} instance [description]
     * @return {IContainer}          [description]
     */
    instance(name, instance) {
        if(!isFunction(instance)) {
            this.#instances[name] = instance;
            return this;
        } else {
            throw TypeError('注册对象不可以是函数或者类');
        }
    }

    /**
     * [绑定注册类与工厂函数]
     * @param  {string} name     [单例对象名称]
     * @param  {FunctionConstructor} concrete [单例对象、类或者对象生产方法]
     * @param {boolean} singleton [是否单例]
     * @return {IContainer}          [返回容器]
     */
    bind(name, concrete, singleton = false) {
        this.#bindings[name] = new RegisterContext(name, concrete, this, singleton);
        return this;
    }

    /**
     * 绑定函数
     * @param {string} method
     * @param {Function} callback
     * */
    bindMethod(method, callback) {
        this.#methodBindings[this.parseBindMethod(method)] = callback;
    }

    /**
     * 解析函数名称
     * @param {string} method
     * @return {string}
     * */
    parseBindMethod(method) {
        if(isArray(method)) {
            return `${method[0]}@${method[1]}`;
        }
        return method;
    }

    /**
     * 判断函数是否绑定
     * @param {string} method
     * @return {boolean}
     * */
    hasMethodBinding(method) {
        method = this.parseBindMethod(method);
        let bindings = this.#methodBindings;
        return typeof bindings[method] !== 'undefined';
    }

    /**
     * 调用绑定函数
     * @param {string} method
     * @param {IArguments} params
     * @return {any}
     * */
    callMethodBinding(method, ...params) {
        let bindings = this.#methodBindings;
        if(this.hasMethodBinding(method)) {
            return bindings[method](...params);
        }
    }
    /**
     * [单例对象注册]
     * @param  {string} name     [单例对象名称]
     * @param  {FunctionConstructor} instance [单例对象、类或者对象生产方法]
     * @return {IContainer}          [返回容器]
     */
    singleton(name, instance) {
        return this.bind(name, instance, true);
    }

    /**
     * 获取别名
     * @param {string} name
     * @return {string}
     * */
    getAlias(name) {
        let aliases = this.#aliases;
        if(typeof aliases[name] === 'undefined') {
            return name;
        }
        return this.getAlias(name);
    }

    /**
     * 创建绑定对象
     * @param {string} name
     * @param {IArguments} params
     * @return {any}
     * */
    make(name, ...params) {
        return this.resolve(name, ...params);
    }

    /**
     * @param {string} name
     * @param {IArguments} params
     * */
    resolve(name, ...params) {
        name = this.getAlias(name);
        let instances = this.#instances;
        if(typeof instances[name] !== 'undefined') {
            return instances[name];
        }
        let bindings = this.#bindings;
        /**
         * @var {RegisterContext} context
         * */
        let context = bindings[name];
        if(typeof context !== 'undefined') {
            let instance = context.resolve(...params);
            if(context.singleton) {
                instances[name] = instance;
            }
            return instance;
        } else {
            return null;
        }
    }
    /**
     * [获取或者创建对象]
     * @param  {string} name   [对象注册名称]
     * @return {any}        [返回注册对象实例]
     */
    get(name) {
        return this.resolve(name);
    }

    /**
     * 绑定对象拓展函数
     * @param {string} name
     * @param {Function} callback
     * */
    extend(name, callback) {
        name = this.getAlias(name);
        let instances = this.#instances;
        if(typeof instances[name] !== 'undefined') {
            let instance = instances[name];
            instances[name] = callback(instance, this);
        }
    }

    /**
     * 拓展容器对象属性
     * @param {Object} options
     * */
    mixin(options) {
        each(options, (item, name) => {
            this[name] = item;
        });
    }
}
