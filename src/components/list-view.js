/*
 * 整合了FlatList和SectionList的长列表
 * @Author: czy0729
 * @Date: 2019-04-11 00:46:28
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-08-20 02:56:52
 */
import React from 'react'
import {
  FlatList,
  RefreshControl,
  SectionList,
  TouchableOpacity,
  View,
  Animated
} from 'react-native'
import { observer } from 'mobx-react'
import ActivityIndicator from '@ant-design/react-native/lib/activity-indicator'
import { _, systemStore } from '@stores'
import { runAfter, sleep, date, simpleTime } from '@utils'
import { LIST_EMPTY } from '@constants'
import { TEXT_REFRESHING, TEXT_FAIL, TEXT_NO_MORE, TEXT_EMPTY } from '@constants/text'
import { randomSpeech } from '@constants/speech'
import { Flex } from './flex'
import { Mesume } from './mesume'
import { Text } from './text'
import { ScrollToTop } from './scroll-to-top'

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList)
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)
const RefreshState = {
  Idle: 0,
  HeaderRefreshing: 1,
  FooterRefreshing: 2,
  NoMoreData: 3,
  Failure: 4,
  EmptyData: 5
}
const refreshControlColors = [_.colorMain]

export const ListView = observer(
  class extends React.Component {
    static defaultProps = {
      style: undefined,
      keyExtractor: undefined,
      data: LIST_EMPTY,
      sectionKey: '', // 当有此值, 根据item[section]构造<SectionList>的sections
      sections: undefined,
      progressViewOffset: undefined,
      refreshControlProps: {},
      renderItem: undefined,
      footerRefreshingText: TEXT_REFRESHING,
      footerFailureText: TEXT_FAIL,
      footerNoMoreDataText: TEXT_NO_MORE,
      footerNoMoreDataComponent: undefined,
      footerEmptyDataText: TEXT_EMPTY,
      footerEmptyDataComponent: undefined,
      footerTextType: 'sub',
      optimize: true, // 是否开启长列表优化
      showFooter: true,
      showMesume: true,
      scrollToTop: false, // 自动在顶部补充一区域, 点击列表返回到顶, 安卓用
      lazy: 0, // 当有值, 初始化时当数组长度超过此长度, 会先渲染这个条数的数据, 再正常渲染

      // 此属性对于 iOS 需要有默认值, 否则会出现首次渲染滚动条位置不正确的问题
      scrollIndicatorInsets: {
        right: 1
      },
      onHeaderRefresh: undefined,
      onFooterRefresh: undefined
    }

    state = {
      refreshState: RefreshState.Idle,
      rendered: false
    }

    componentDidMount() {
      const { data, lazy } = this.props
      this.updateRefreshState(data)

      if (lazy) {
        runAfter(async () => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              const { rendered } = this.state
              if (!rendered) {
                this.setState({
                  rendered: true
                })
              }
            }, 160)
          })
        })
      }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
      const { data } = nextProps
      this.updateRefreshState(data)
    }

    updateRefreshState = data => {
      const { list = [], pagination = {}, _loaded } = data
      let refreshState

      if (!_loaded) {
        refreshState = RefreshState.Idle
      } else if (list.length === 0) {
        refreshState = RefreshState.EmptyData
      } else if (pagination.page < pagination.pageTotal) {
        refreshState = RefreshState.Idle
      } else {
        refreshState = RefreshState.NoMoreData
      }

      if (refreshState !== undefined) {
        this.setState({
          refreshState
        })
      }
    }

    scrollToIndex = Function.prototype
    scrollToItem = Function.prototype
    scrollToOffset = Function.prototype

    // eslint-disable-next-line consistent-return
    onHeaderRefresh = async () => {
      const { lazy, onHeaderRefresh } = this.props
      const { rendered } = this.state
      if (lazy && !rendered) {
        return undefined
      }

      if (onHeaderRefresh) {
        this.setState({
          refreshState: RefreshState.HeaderRefreshing
        })

        await sleep(400)
        onHeaderRefresh()
      }
    }

    // eslint-disable-next-line consistent-return
    onFooterRefresh = async () => {
      const { lazy, onFooterRefresh } = this.props
      const { rendered } = this.state
      if (lazy && !rendered) {
        return undefined
      }

      if (onFooterRefresh) {
        this.setState({
          refreshState: RefreshState.FooterRefreshing
        })
        await sleep(640)
        onFooterRefresh()
      }
    }

    onEndReached = () => {
      if (this.shouldStartFooterRefreshing()) {
        this.onFooterRefresh()
      }
    }

    shouldStartHeaderRefreshing = () => {
      const { refreshState } = this.state
      if (
        refreshState == RefreshState.HeaderRefreshing ||
        refreshState == RefreshState.FooterRefreshing
      ) {
        return false
      }
      return true
    }

    shouldStartFooterRefreshing = () => {
      const { refreshState } = this.state
      return refreshState === RefreshState.Idle
    }

    connectRef = ref => {
      if (ref) {
        this.scrollToIndex = params => ref.scrollToIndex(params)
        this.scrollToItem = params => ref.scrollToItem(params)
        this.scrollToOffset = params => ref.scrollToOffset(params)
        this.scrollToLocation = params => ref.scrollToLocation(params)
      }
    }

    get style() {
      const { style } = this.props
      return style ? [this.styles.container, style] : this.styles.container
    }

    get commonProps() {
      const {
        optimize,
        showFooter,
        ListFooterComponent = null,
        showsVerticalScrollIndicator,
        lazy
      } = this.props
      const { refreshState, rendered } = this.state
      return {
        ref: this.connectRef,
        style: this.style,

        // 安卓默认为true, iOS为false, false时列表的Text才能自由选择复制
        // removeClippedSubviews: false,

        refreshing: refreshState === RefreshState.HeaderRefreshing,
        refreshControl: this.renderRefreshControl(),
        ListFooterComponent: showFooter
          ? this.renderFooter(refreshState)
          : ListFooterComponent,
        onRefresh: this.onHeaderRefresh,
        onEndReached: this.onEndReached,
        onEndReachedThreshold: 0.5,

        // optimize
        initialNumToRender: 48,
        windowSize: optimize ? 12 : undefined,
        maxToRenderPerBatch: optimize ? 48 : undefined,
        updateCellsBatchingPeriod: optimize ? 48 : undefined,
        showsVerticalScrollIndicator:
          lazy && !rendered ? false : showsVerticalScrollIndicator
      }
    }

    get section() {
      const { data, sectionKey, sections, lazy } = this.props
      const { rendered } = this.state
      let _sections = []
      if (sections) {
        _sections = lazy && !rendered ? sections.slice(0, lazy) : sections.slice()
      } else {
        const sectionsMap = {}
        data.list.slice().forEach(item => {
          const title = item[sectionKey]
          if (sectionsMap[title] === undefined) {
            sectionsMap[title] = _sections.length
            _sections.push({
              title,
              data: [item]
            })
          } else {
            _sections[sectionsMap[title]].data.push(item)
          }
        })
      }
      return _sections
    }

    get data() {
      const { data, lazy } = this.props
      const { rendered } = this.state
      if (lazy && !rendered) {
        return data.list.slice(0, lazy)
      }

      return Array.isArray(data.list) ? data.list : data.list.slice()
    }

    renderFooter(refreshState) {
      let footer = null
      const {
        data,
        lazy,
        footerRefreshingText,
        footerFailureText,
        // footerNoMoreDataText,
        footerEmptyDataText,
        footerRefreshingComponent,
        footerFailureComponent,
        footerNoMoreDataComponent,
        footerEmptyDataComponent,
        footerTextType,
        showMesume,
        onHeaderRefresh,
        onFooterRefresh
      } = this.props
      const { rendered } = this.state
      if (lazy && !rendered) {
        return footer
      }

      switch (refreshState) {
        case RefreshState.Idle:
          footer = <View style={this.styles.footerContainer} />
          break
        case RefreshState.Failure:
          footer = (
            <TouchableOpacity
              onPress={() => {
                if (data.list.length === 0) {
                  if (onHeaderRefresh) {
                    onHeaderRefresh(RefreshState.HeaderRefreshing)
                  }
                } else if (onFooterRefresh) {
                  onFooterRefresh(RefreshState.FooterRefreshing)
                }
              }}
            >
              {footerFailureComponent || (
                <View style={this.styles.footerContainer}>
                  <Text
                    style={this.styles.footerText}
                    type={footerTextType}
                    size={13}
                    lineHeight={15}
                    align='center'
                  >
                    {footerFailureText}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )
          break
        case RefreshState.EmptyData:
          footer = (
            <TouchableOpacity
              onPress={() => {
                if (onHeaderRefresh) {
                  onHeaderRefresh(RefreshState.HeaderRefreshing)
                }
              }}
            >
              {footerEmptyDataComponent || (
                <Flex
                  style={this.styles.footerEmpty}
                  direction='column'
                  justify='center'
                >
                  {showMesume && <Mesume size={80} />}
                  <Text
                    style={[this.styles.footerText, _.mt.sm]}
                    type={footerTextType}
                    size={13}
                    lineHeight={15}
                    align='center'
                  >
                    {footerEmptyDataText}
                  </Text>
                </Flex>
              )}
            </TouchableOpacity>
          )
          break
        case RefreshState.FooterRefreshing:
          footer = footerRefreshingComponent || (
            <Flex style={this.styles.footerNoMore} justify='center' direction='column'>
              <ActivityIndicator size='small' />
              <Text
                style={[this.styles.footerText, _.mt.sm]}
                type={footerTextType}
                align='center'
                size={13}
                lineHeight={15}
              >
                {footerRefreshingText}
              </Text>
            </Flex>
          )
          break
        case RefreshState.NoMoreData:
          footer =
            footerNoMoreDataComponent ||
            (showMesume ? (
              <Flex
                style={this.styles.footerNoMore}
                justify='center'
                direction='column'
              >
                <Mesume size={80} />
                {systemStore.setting.speech && (
                  <Text
                    style={[this.styles.footerText, _.mt.sm]}
                    type={footerTextType}
                    align='center'
                    size={13}
                    lineHeight={15}
                  >
                    {data._filter ? `已过滤${data._filter}个敏感条目` : randomSpeech()}
                  </Text>
                )}
              </Flex>
            ) : null)
          break
        default:
          break
      }
      return footer
    }

    renderRefreshControl() {
      const { data, progressViewOffset, refreshControlProps } = this.props
      const { refreshState } = this.state
      return (
        <RefreshControl
          title={
            data._loaded ? `上次刷新时间: ${simpleTime(date(data._loaded))}` : undefined
          }
          colors={refreshControlColors}
          titleColor={_.colorSub}
          tintColor={_.colorSub}
          progressViewOffset={progressViewOffset}
          refreshing={refreshState === RefreshState.HeaderRefreshing}
          onRefresh={this.onHeaderRefresh}
          {...refreshControlProps}
        />
      )
    }

    renderScrollToTop() {
      const { scrollToTop } = this.props
      if (!scrollToTop) {
        return null
      }

      return (
        <ScrollToTop
          scrollToIndex={this.scrollToIndex}
          scrollToLocation={this.scrollToLocation}
        />
      )
    }

    render() {
      const {
        style,
        data,
        sectionKey,
        sections,
        progressViewOffset,
        refreshControlProps,
        optimize,
        showFooter,
        animated,
        scrollToTop,
        showsVerticalScrollIndicator,
        lazy,
        ...other
      } = this.props
      let $list
      if (sectionKey || sections) {
        if (animated) {
          $list = (
            <AnimatedSectionList
              sections={this.section}
              {...this.commonProps}
              {...other}
            />
          )
        } else {
          $list = (
            <SectionList sections={this.section} {...this.commonProps} {...other} />
          )
        }
      } else if (animated) {
        $list = <AnimatedFlatList data={this.data} {...this.commonProps} {...other} />
      } else {
        $list = <FlatList data={this.data} {...this.commonProps} {...other} />
      }

      return (
        <>
          {$list}
          {this.renderScrollToTop()}
        </>
      )
    }

    get styles() {
      return memoStyles()
    }
  }
)

const memoStyles = _.memoStyles(_ => ({
  container: {
    minHeight: parseInt(_.window.height * 0.24)
  },
  footerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    paddingVertical: 8,
    paddingHorizontal: _.lg
  },
  footerText: {
    maxWidth: _.window.contentWidth - 2 * _.md,
    ..._.fontSize(14)
  },
  footerEmpty: {
    minHeight: 240
  },
  footerNoMore: {
    padding: 8
  }
}))
