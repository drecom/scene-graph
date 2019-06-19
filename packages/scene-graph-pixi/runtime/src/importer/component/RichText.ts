type RichTextStyle = {
  name: string;
  params: {
    [key: string]: any
  }
};

type RichTextSizeStyle = RichTextStyle & {
  params: {
    value: number;
  }
};
type RichTextColorStyle = RichTextStyle & {
  params: {
    value: string | null;
  }
};
type RichTextOutlineStyle = RichTextStyle & {
  params: {
    color: string | null;
    width: number;
  }
};
type RichTextFragment = {
  text: string;
  styles: RichTextStyle[]
};

/**
 * RichText extension
 * It allows
 */
export class RichText {
  public static readonly PARSER_TAG_NAME: string = 'SGMEDRICHTEXT';

  /**
   * Create container contains styled texts
   */
  public static createContainer(
    input: string,
    defaultParams: PIXI.TextStyleOptions = {}
  ): PIXI.Container {
    // TODO: format variant
    const fragments = RichText.parseBBCode(input);
    const container = RichText.createRichTextContainer(fragments, defaultParams);
    return container;
  }

  /**
   * Parse HTMLDocumentNode and generate intermediate style data
   */
  private static parseNodeStyle(node: HTMLElement): RichTextStyle | null {
    const nodeName = node.nodeName.toUpperCase();

    switch (nodeName) {
      case '#TEXT': break;
      case 'B':
      case 'I':
      case 'U': {
        return { name: nodeName, params: {} };
        break;
      }
      case 'SIZE': {
        const value = node.getAttribute(nodeName);
        return {
          name: nodeName,
          params: {
            value: value ? parseInt(value, 10) : 0
          }
        } as RichTextSizeStyle;
        break;
      }
      case 'COLOR': {
        const value = node.getAttribute(nodeName);
        return {
          name: nodeName,
          params: {
            value: value || ''
          }
        } as RichTextColorStyle;
        break;
      }
      case 'OUTLINE': {
        const color = node.getAttribute('color');
        const width = node.getAttribute('width');
        return {
          name: nodeName,
          params: {
            color: color || '',
            width: width ? parseInt(width, 10) : 0
          }
        } as RichTextOutlineStyle;
        break;
      }
      default: break;
    }

    return null;
  }

  /**
   *
   */
  private static collectChildNodes(
    nodes: NodeListOf<ChildNode>,
    fragments: RichTextFragment[] = [],
    styles: RichTextStyle[] = []
  ): RichTextFragment[] {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i] as HTMLElement;
      const style = RichText.parseNodeStyle(node);

      if (style) {
        styles.push(style);
      }

      if (node.childNodes.length > 0) {
        RichText.collectChildNodes(node.childNodes, fragments, styles);
      }

      if (node.nodeValue) {
        fragments.push({ text: node.nodeValue, styles: styles.slice(0) });
      }

      if (style) {
        styles.pop();
      }
    }

    return fragments;
  }

  private static parseBBCode(input: string): RichTextFragment[] {
    const richTextHtml = `<${RichText.PARSER_TAG_NAME}>${input}</${RichText.PARSER_TAG_NAME}>`;
    const replacedRichTextString = richTextHtml.replace(/<([a-zA-Z]+)=([^\s]+)/g, '<$1 $1=$2');

    const tempHtml = document.createElement('html');
    tempHtml.innerHTML = replacedRichTextString;
    const tags = tempHtml.getElementsByTagName('*');

    let offset = 0;
    let richTextTag = tags[offset];
    while (richTextTag && richTextTag.tagName.toUpperCase() !== RichText.PARSER_TAG_NAME) {
      richTextTag = tags[++offset];
    }

    return RichText.collectChildNodes(richTextTag.childNodes);
  }

  private static pixiTextStyleOptionsByFragment(fragment: RichTextFragment): PIXI.TextStyleOptions {
    const params: PIXI.TextStyleOptions = {};
    for (let j = 0; j < fragment.styles.length; j++) {
      const style = fragment.styles[j];
      switch (style.name) {
        case 'B':     params.fontWeight = 'bold'; break;
        case 'I':     params.fontStyle = 'italic'; break;
        case 'SIZE':  params.fontSize = parseInt(style.params.value, 10); break;
        case 'COLOR': params.fill = [style.params.value]; break;
        case 'OUTLINE': {
          params.stroke = style.params.color;
          params.strokeThickness = parseInt(style.params.width, 10);
          break;
        }
      }
    }

    return params;
  }

  private static createRichTextContainer(
    fragments: RichTextFragment[],
    defaultParams: PIXI.TextStyleOptions = {}
  ): PIXI.Container {
    const container = new PIXI.Container();

    let x = 0;
    let y = 0;
    let lastLineHeight = 0;
    for (let i = 0; i < fragments.length; i++) {
      const fragment = fragments[i];
      const params = RichText.pixiTextStyleOptionsByFragment(fragment);
      const defaultParamsClone = Object.assign({}, defaultParams);
      const style = new PIXI.TextStyle(Object.assign(defaultParamsClone, params));
      const lines = fragment.text.split('\n');
      for (let j = 0; j < lines.length; j++) {
        const line = lines[j];

        if (j >= 1) {
          x = 0;
          y += lastLineHeight;
          lastLineHeight = 0;
        }

        // empty char after line break
        if (line === '') {
          continue;
        }

        const text = new PIXI.Text(line, style);
        if (lastLineHeight < text.height) {
          lastLineHeight = text.height;
        }

        text.position.set(x, y);
        x += text.width;
        container.addChild(text);
      }
    }

    return container;
  }
}
