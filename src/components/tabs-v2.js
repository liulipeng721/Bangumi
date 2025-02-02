/*
 * @Author: czy0729
 * @Date: 2020-09-24 16:31:53
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-08-18 17:48:31
 */
import React, { useMemo } from 'react'
import { TabBar, SceneMap } from 'react-native-tab-view'
import TabView from '@components/@/react-native-tab-view/TabView'
import { _ } from '@stores'
import { IOS } from '@constants'
import { Flex } from './flex'
import { Text } from './text'

const W_INDICATOR = 16 * _.ratio

export const TabsV2 = ({
  routes = [], // Array<{ key: string, title: string }>
  tabBarLength,
  page = 0,
  textColor,
  backgroundColor,
  borderBottomColor,
  underlineColor,
  renderItem,
  renderLabel,
  onChange = Function.prototype,
  ...other
}) => {
  const styles = memoStyles()
  const renderScene = useMemo(
    () =>
      SceneMap(
        Object.assign(
          {},
          ...routes.map(item => ({
            [item.key]: () => renderItem(item)
          }))
        )
      ),
    [routes]
  )
  const W_TAB = useMemo(
    () => _.window.width / (tabBarLength || routes.length),
    [tabBarLength, routes]
  )
  const tabBarStyle = useMemo(
    () => [
      styles.tabBar,
      backgroundColor && {
        backgroundColor
      },
      borderBottomColor && {
        borderBottomColor
      }
    ],
    [styles, backgroundColor, borderBottomColor]
  )
  const tabStyle = useMemo(
    () => [
      styles.tab,
      {
        width: W_TAB
      }
    ],
    [styles, W_TAB]
  )
  const indicatorStyle = useMemo(
    () => [
      styles.indicator,
      {
        marginLeft: (W_TAB - W_INDICATOR) / 2
      },
      underlineColor && {
        backgroundColor: underlineColor
      }
    ],
    [styles, W_TAB, underlineColor]
  )
  const textStyle = useMemo(
    () =>
      textColor && {
        color: textColor
      },
    [textColor]
  )
  return (
    <TabView
      lazyPreloadDistance={0}
      navigationState={{
        index: page,
        routes
      }}
      renderTabBar={props => (
        <TabBar
          {...props}
          style={tabBarStyle}
          tabStyle={tabStyle}
          labelStyle={styles.label}
          indicatorStyle={indicatorStyle}
          pressOpacity={1}
          pressColor='transparent'
          scrollEnabled
          renderLabel={
            renderLabel ||
            (({ route, focused }) => (
              <Flex style={styles.labelText} justify='center'>
                <Text style={textStyle} type='title' size={13} bold={focused}>
                  {route.title}
                </Text>
              </Flex>
            ))
          }
        />
      )}
      renderScene={renderScene}
      onIndexChange={onChange}
      {...other}
    />
  )
}

const memoStyles = _.memoStyles(_ => ({
  tabBar: {
    backgroundColor: IOS
      ? 'transparent'
      : _.select(
          'transparent',
          _.deepDark ? _._colorPlain : _._colorDarkModeLevel1
        ),
    borderBottomWidth: _.select(
      IOS ? 0 : _.hairlineWidth,
      _.deepDark ? 0 : _.hairlineWidth
    ),
    borderBottomColor: _.colorBorder,
    elevation: 0
  },
  tab: {
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
    backgroundColor: _.colorMain,
    borderRadius: 4
  }
}))
