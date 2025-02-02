/*
 * RN渲染HTML v2
 * @Doc https://github.com/archriss/react-native-render-html
 * @Author: czy0729
 * @Date: 2019-04-29 19:54:57
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-08-20 19:22:11
 */
import React from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react'
import { _, userStore, systemStore } from '@stores'
import { open } from '@utils'
import { cheerio, HTMLDecode } from '@utils/html'
import decoder from '@utils/thirdParty/html-entities-decoder'
import { s2t } from '@utils/thirdParty/cn-char'
import { IOS, PAD } from '@constants'
import HTML from '../@/react-native-render-html'
import { BgmText, bgmMap } from '../bgm-text'
import { translateAll } from '../katakana'
import Error from './error'
import MaskText from './mask-text'
import QuoteText from './quote-text'
import LineThroughtText from './line-throught-text'
import HiddenText from './hidden-text'
import Li from './li'
import ToggleImage from './toggle-image'

const padFontSizeIncrease = PAD === 2 ? 3 : 2
const padLineHeightIncrease = PAD === 2 ? 10 : 4

function getIncreaseFontSize(fontSize) {
  if (!fontSize || !_.isPad) return fontSize
  return Number(fontSize) + padFontSizeIncrease
}

function getIncreaseLineHeight(lineHeight) {
  if (!lineHeight || !_.isPad) return lineHeight
  return Number(lineHeight) + padLineHeightIncrease
}

function fixedBaseFontStyle(baseFontStyle = {}) {
  if (!_.isPad) return baseFontStyle

  const _baseFontStyle = {
    ...baseFontStyle
  }
  if (_baseFontStyle.fontSize) _baseFontStyle.fontSize += padFontSizeIncrease
  if (_baseFontStyle.lineHeight) {
    _baseFontStyle.lineHeight += padLineHeightIncrease
  }

  return _baseFontStyle
}

// 一些超展开内容文本样式的标记
const spanMark = {
  mask: 'background-color:#555;',
  bold: 'font-weight:bold;',
  lineThrough: 'line-through;',
  hidden: 'visibility:hidden;'
}
const regFixedQ = /<\/(.+?)\.\.\.<\/span>$/

export const RenderHtml = observer(
  class extends React.Component {
    static defaultProps = {
      style: undefined,
      baseFontStyle: {},
      linkStyle: {},
      imagesMaxWidth: _.window.width - 2 * _.wind,
      html: '',
      autoShowImage: false,
      onLinkPress: Function.prototype,
      onImageFallback: Function.prototype
    }

    state = {
      error: false,
      katakanaResult: {}
    }

    async componentDidMount() {
      const { katakana, html } = this.props
      if (katakana) {
        const { katakana: settingKatakana } = systemStore.setting
        if (settingKatakana) {
          const katakanaResult = await translateAll(html)
          if (katakanaResult) {
            this.setState({
              katakanaResult
            })
          }
        }
      }
    }

    componentDidCatch() {
      console.info('@/components/render-html', 'componentDidCatch')

      this.setState({
        error: true
      })
    }

    /**
     * 生成render-html配置
     */
    generateConfig = (imagesMaxWidth, baseFontStyle, linkStyle) => ({
      imagesMaxWidth: _.window.width,
      baseFontStyle: {
        ...this.defaultBaseFontStyle,
        ...fixedBaseFontStyle(baseFontStyle)
      },
      tagsStyles: {
        a: {
          paddingRight: _.sm,
          color: _.colorMain,
          textDecorationColor: _.colorMain,
          ...linkStyle
        }
      },
      textSelectable: true,

      // 渲染定义tag前回调
      renderers: {
        img: ({ src = '' }, children, convertedCSSStyles, { key }) => {
          const { autoShowImage, onImageFallback } = this.props
          return (
            <ToggleImage
              key={key}
              style={_.mt.xs}
              src={src}
              autoSize={imagesMaxWidth}
              placeholder={false}
              imageViewer
              show={autoShowImage}
              onImageFallback={() => onImageFallback(src)}
            />
          )
        },
        span: (
          { style = '' },
          children,
          convertedCSSStyles,
          { rawChildren, key, baseFontStyle }
        ) => {
          try {
            // @todo 暂时没有对样式混合情况作出正确判断, 以重要程度优先(剧透 > 删除 > 隐藏 > 其他)
            // 防剧透字
            if (style.includes(spanMark.mask)) {
              const text = []
              const target = rawChildren[0]
              if (target) {
                if (target.children) {
                  // 防剧透字中有表情
                  target.children.forEach((item, index) => {
                    if (item.data) {
                      // 文字
                      text.push(item.data)
                    } else if (item.children) {
                      const _baseFontStyle = fixedBaseFontStyle(baseFontStyle)
                      item.children.forEach((i, idx) => {
                        // 表情
                        text.push(
                          <BgmText
                            // eslint-disable-next-line react/no-array-index-key
                            key={`${index}-${idx}`}
                            size={_baseFontStyle.fontSize}
                            lineHeight={_baseFontStyle.lineHeight}
                          >
                            {i.data}
                          </BgmText>
                        )
                      })
                    }
                  })
                } else {
                  // 防剧透字中没表情
                  text.push(target.data)
                }
              }
              return (
                <MaskText
                  key={key}
                  style={{
                    ...this.defaultBaseFontStyle,
                    ...baseFontStyle
                  }}
                >
                  {text}
                </MaskText>
              )
            }

            // 删除字
            if (style.includes(spanMark.lineThrough)) {
              const target = rawChildren[0]
              const text =
                (target &&
                  target.parent &&
                  target.parent.children[0] &&
                  target.parent.children[0].data) ||
                (target.children[0] && target.children[0].data) ||
                ''
              return (
                <LineThroughtText
                  key={key}
                  style={{
                    ...this.defaultBaseFontStyle,
                    ...baseFontStyle
                  }}
                >
                  {text}
                </LineThroughtText>
              )
            }

            // 隐藏字
            if (style.includes(spanMark.hidden)) {
              const target = rawChildren[0]
              const text = (target && target.data) || ''
              return (
                <HiddenText
                  key={key}
                  style={{
                    ...this.defaultBaseFontStyle,
                    ...baseFontStyle
                  }}
                >
                  {text}
                </HiddenText>
              )
            }
          } catch (error) {
            warn('RenderHtml', 'generateConfig', error)
          }

          return children
        },
        q: (attrs, children, convertedCSSStyles, { key }) => (
          <QuoteText key={key}>{children}</QuoteText>
        ),
        li: (attrs, children, convertedCSSStyles, { key }) => (
          <Li key={key}>{children}</Li>
        )
      }
    })

    onLinkPress = (evt, href) => {
      const { onLinkPress } = this.props
      if (onLinkPress) {
        onLinkPress(href)
      } else {
        open(href)
      }
    }

    formatHTML = () => {
      const { html, baseFontStyle } = this.props
      const { katakanaResult } = this.state

      try {
        /**
         * iOS碰到过文本里巨大会遇到Maximun stack size exceeded的错误
         */
        // if (IOS && html.length > 100000) {
        //   return html
        // }

        let _html = html

        /**
         * 把bgm表情替换成bgm字体文字
         */
        const $ = cheerio(html)
        $('img[smileid]').replaceWith((index, element) => {
          const $img = cheerio(element)
          const alt = $img.attr('alt') || ''
          if (alt) {
            // bgm偏移量24
            const index = parseInt(alt.replace(/\(bgm|\)/g, '')) - 24

            // 限制用户不显示bgm表情
            if (userStore.isLimit) {
              return alt
            }

            if (bgmMap[index]) {
              const _baseFontStyle = fixedBaseFontStyle(baseFontStyle)
              return `<span style="font-family:bgm;font-size:${
                _baseFontStyle.fontSize || this.defaultBaseFontStyle.fontSize
              }px;line-height:${
                _baseFontStyle.lineHeight || this.defaultBaseFontStyle.lineHeight
              }px;user-select:all">${bgmMap[index]}</span>`
            }
            return alt
          }
          return $img.html()
        })
        _html = $.html()

        /**
         * 片假名后面加上小的英文
         */
        const jps = Object.keys(katakanaResult)
        if (jps.length) {
          jps.forEach(jp => {
            const reg = new RegExp(jp, 'g')
            _html = _html.replace(
              reg,
              `${jp}<span style="font-size: ${getIncreaseFontSize(10)}px"> (${
                katakanaResult[jp]
              }) </span>`
            )
          })
        }

        /**
         * 给纯文字包上span, 否则安卓不能自由复制
         */
        _html = `<div>${_html}</div>`
        const match = _html.match(/>[^<>]+?</g)
        if (match) {
          match.forEach(item => (_html = _html.replace(item, `><span${item}/span><`)))
        }

        /**
         * 去除<q>里面的图片
         * (非常特殊的情况, 无法预测, 安卓Text里面不能包含其他元素)
         */
        if (!IOS) {
          if (_html.includes('<q>')) {
            _html = HTMLDecode(_html).replace(/<q>(.+?)<\/q>/g, (match, q) => {
              let _q = q.replace(/<img/g, ' img')

              // @hack: 暂时没办法处理像 </smal...结尾这样的情况
              // 因为之前的错误全局HTMLDecode, 没办法再处理
              if (regFixedQ.test(_q)) {
                const { index } = _q.match(regFixedQ)
                _q = _q.slice(0, index)
              }
              return `<q>${_q}</span></q>`
            })
          }
        }

        /**
         * 安卓识别<pre>目前报错, 暂时屏蔽此标签
         */
        if (!IOS) {
          if (_html.includes('<pre>')) {
            _html = HTMLDecode(_html)
              .replace(/<pre>/g, '<div>')
              .replace(/<\/pre>/g, '</div>')
          }
        }

        /**
         * 缩小引用的字号
         */
        _html = _html.replace(
          /<div class="quote"><q>/g,
          `<div class="quote"><q style="font-size: ${getIncreaseFontSize(
            12
          )}px; line-height: ${getIncreaseLineHeight(16)}px">`
        )

        /**
         * 去除图片之间的br
         */
        _html = _html.replace(/<br><img/g, '<img')

        /**
         * 去除暂时无法支持的html
         */
        _html = _html.replace(/<ruby>(.+?)<\/ruby>/g, '')

        /**
         * 转义bug
         */
        _html = _html.replace(/<;/g, '< ;')

        const { s2t: _s2t } = systemStore.setting
        if (_s2t) _html = s2t(decoder(_html))

        return HTMLDecode(_html)
      } catch (error) {
        warn('RenderHtml', 'formatHTML', error)
        return HTMLDecode(html)
      }
    }

    /**
     * @issue iOS开发遇到奇怪bug, 文字太多当lineHeight大于15, 不显示?
     */
    get defaultBaseFontStyle() {
      return {
        fontSize: 15 + _.fontSizeAdjust + (_.isPad ? padFontSizeIncrease : 0),
        lineHeight: 24 + (_.isPad ? padLineHeightIncrease : 0),
        color: _.colorTitle
      }
    }

    render() {
      const {
        style,
        baseFontStyle,
        linkStyle,
        imagesMaxWidth,
        html,
        autoShowImage,
        onLinkPress,
        ...other
      } = this.props
      const { error } = this.state
      if (error) {
        return <Error />
      }

      const _baseFontStyle = fixedBaseFontStyle(baseFontStyle)
      return (
        <View style={style}>
          <HTML
            html={this.formatHTML()}
            baseFontStyle={{
              ...this.defaultBaseFontStyle,
              ..._baseFontStyle
            }}
            onLinkPress={this.onLinkPress}
            {...this.generateConfig(imagesMaxWidth, _baseFontStyle, linkStyle)}
            {...other}
          />
        </View>
      )
    }
  }
)
