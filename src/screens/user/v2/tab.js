/*
 * @Author: czy0729
 * @Date: 2020-06-03 09:53:54
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-08-18 17:04:42
 */
import React from 'react'
import { View, Animated } from 'react-native'
import { TabBar, SceneMap } from 'react-native-tab-view'
import TabView from '@components/@/react-native-tab-view/TabView'
import { Flex, Text, Heatmap } from '@components'
import { _ } from '@stores'
import { obc } from '@utils/decorators'
import { IOS, DEV } from '@constants'
import { MODEL_SUBJECT_TYPE } from '@constants/model'
import TabBarLeft from './tab-bar-left'
import ToolBar from './tool-bar'
import List from './list'
import { tabs, H_BG, H_TABBAR, H_HEADER } from './store'

class Tab extends React.Component {
  onIndexChange = index => {
    const { $ } = this.context
    const { onIndexChange } = this.props
    onIndexChange(index)
    $.onChange(index)
  }

  onSelect = title => {
    const { onSelectSubjectType } = this.props
    onSelectSubjectType(title)
  }

  ListHeaderComponent = (
    <>
      <View
        style={{
          height: H_BG + H_TABBAR
        }}
      />
      <ToolBar />
    </>
  )

  renderScene = SceneMap(
    Object.assign(
      {},
      ...tabs.map(item => ({
        [item.key]: () => (
          <List
            title={item.title}
            ListHeaderComponent={this.ListHeaderComponent}
            scrollEventThrottle={16}
            onScroll={this.props.onScroll}
          />
        )
      }))
    )
  )

  get navigationState() {
    const { $ } = this.context
    const { page } = $.state
    return {
      index: page,
      routes: tabs
    }
  }

  get transform() {
    const { scrollY } = this.props
    return {
      transform: [
        {
          translateY: scrollY.interpolate({
            inputRange: [-H_BG, 0, H_BG - H_HEADER, H_BG],
            outputRange: [H_BG * 2, H_BG, H_HEADER, H_HEADER]
          })
        }
      ]
    }
  }

  renderLabel = ({ route, focused }) => {
    const { $ } = this.context
    const { subjectType } = $.state
    const count = $.counts[MODEL_SUBJECT_TYPE.getTitle(subjectType)][route.title]
    return (
      <Flex style={this.styles.labelText} justify='center'>
        <Text type='title' size={13} bold={focused}>
          {route.title.replace('看', $.action)}
        </Text>
        {!!count && (
          <Text type='sub' size={11} lineHeight={13}>
            {' '}
            {count}{' '}
          </Text>
        )}
      </Flex>
    )
  }

  renderTabBar = props => (
    <Animated.View style={[this.styles.tabBarWrap, this.transform]}>
      <TabBar
        {...props}
        style={this.styles.tabBar}
        tabStyle={this.styles.tab}
        labelStyle={this.styles.label}
        indicatorStyle={this.styles.indicator}
        pressOpacity={1}
        pressColor='transparent'
        scrollEnabled
        renderLabel={this.renderLabel}
      />
      <Heatmap right={_.wind + 62} id='我的.标签页切换' transparent />
      <Heatmap right={_.wind} id='我的.标签页点击' transparent />
    </Animated.View>
  )

  render() {
    rerender('User.Tab')

    return (
      <>
        <TabView
          lazy={!IOS || DEV}
          lazyPreloadDistance={0}
          navigationState={this.navigationState}
          renderTabBar={this.renderTabBar}
          renderScene={this.renderScene}
          onIndexChange={this.onIndexChange}
        />
        <Animated.View style={[this.styles.tabBarLeft, this.transform]}>
          <TabBarLeft onSelect={this.onSelect} />
        </Animated.View>
      </>
    )
  }

  get styles() {
    return memoStyles()
  }
}

export default obc(Tab)

const W_TAB_BAR_LEFT = 68 * _.ratio
const W_TAB = (_.window.width - W_TAB_BAR_LEFT) / 5
const W_INDICATOR = 16 * _.ratio
const memoStyles = _.memoStyles(_ => ({
  tabBarWrap: {
    position: 'absolute',
    zIndex: 2,
    top: 0,
    right: 0,
    left: 0
  },
  tabBar: {
    paddingLeft: W_TAB_BAR_LEFT,
    backgroundColor: _.select(
      _.colorPlain,
      _.deepDark ? _._colorPlain : _._colorDarkModeLevel1
    ),
    borderBottomWidth: _.flat ? 0 : _.select(_.hairlineWidth, 0),
    borderBottomColor: _.colorBorder,
    shadowOpacity: 0,
    elevation: 0
  },
  tab: {
    width: W_TAB,
    height: 48 * _.ratio
  },
  label: {
    padding: 0
  },
  labelText: {
    width: '100%'
  },
  indicator: {
    width: W_INDICATOR,
    height: 4,
    marginLeft: (W_TAB - W_INDICATOR) / 2 + W_TAB_BAR_LEFT,
    backgroundColor: _.colorMain,
    borderRadius: 4
  },
  tabBarLeft: {
    position: 'absolute',
    zIndex: 3,
    left: 0,
    marginTop: 2
  }
}))
