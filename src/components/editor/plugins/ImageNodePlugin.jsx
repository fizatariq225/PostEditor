import { DecoratorNode } from 'lexical';
import React from 'react';

export class ImageNode extends DecoratorNode {
  __src;
  __alt;
  __width;
  __height;

  static getType() {
    return 'image';
  }

  static clone(node) {
    return new ImageNode(node.__src, node.__alt, node.__width, node.__height, node.__key);
  }

  constructor(src = '', alt = 'Image', width = '100%', height = 'auto', key) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__width = width;
    this.__height = height;
  }

  createDOM() {
    const img = document.createElement('img');
    img.src = this.__src || '';
    img.alt = this.__alt;
    img.style.width = this.__width;
    img.style.height = this.__height;
    img.style.maxWidth = '100%';
    img.style.objectFit = 'contain'; // Ensure image fits within bounds
    img.onerror = () => {
      console.error(`Failed to load image with src: ${this.__src}`);
      img.alt = `Failed to load: ${this.__alt}`; // Update alt text on error
    };
    return img;
  }

  updateDOM(prevNode, dom) {
    if (prevNode.__src !== this.__src) {
      dom.src = this.__src || '';
      console.log(`Updating image src to: ${this.__src}`); // Debug
    }
    if (prevNode.__alt !== this.__alt) dom.alt = this.__alt;
    if (prevNode.__width !== this.__width) dom.style.width = this.__width;
    if (prevNode.__height !== this.__height) dom.style.height = this.__height;
    return false;
  }

  static importJSON(serializedNode) {
    const { src = '', alt = 'Image', width = '100%', height = 'auto' } = serializedNode;
    return $createImageNode(src, alt, width, height);
  }

  exportJSON() {
    return {
      src: this.__src,
      alt: this.__alt,
      width: this.__width,
      height: this.__height,
      type: 'image',
      version: 1,
    };
  }

  decorate() {
    return (
      <img
        src={this.__src}
        alt={this.__alt}
        style={{ width: this.__width, height: this.__height, maxWidth: '100%', objectFit: 'contain' }}
        onError={(e) => {
          console.error(`Failed to load image in React with src: ${this.__src}`);
          e.target.alt = `Failed to load: ${this.__alt}`;
        }}
      />
    );
  }
}

export function $createImageNode(src = '', alt = 'Image', width = '100%', height = 'auto') {
  console.log(`Creating ImageNode with src: ${src}`); // Debug
  return new ImageNode(src, alt, width, height);
}

export function $isImageNode(node) {
  return node instanceof ImageNode;
}