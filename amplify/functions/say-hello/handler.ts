import type {Handler} from 'aws-lambda';
import type { Schema } from '../../data/resource';

export const handler: Schema["sayHello"]["functionHandler"] = async (event) => {
    const { name } = event.arguments;
    return `Hello, ${name}!`;
}