/*
 * @Author: czy0729
 * @Date: 2019-06-03 00:53:10
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-08-19 09:50:48
 */
import React from 'react'
import { View } from 'react-native'
import { Flex, Image, Text, Heatmap } from '@components'
import { SectionTitle, Cover, Tag } from '@screens/_'
import { _ } from '@stores'
import { memo, obc } from '@utils/decorators'
import { appNavigate, getCoverMedium } from '@utils/app'
import { MODEL_SUBJECT_TYPE } from '@constants/model'

export const coverWidth = 64 * _.ratio
export const coverHeight = coverWidth * 1.28
const event = {
  id: '人物.跳转',
  data: {
    from: '出演'
  }
}
const defaultProps = {
  navigation: {},
  style: {},
  jobs: []
}

const Jobs = memo(({ navigation, style, jobs }) => {
  rerender('Mono.Jobs.Main')

  return (
    <View style={[styles.container, style]}>
      <View>
        <SectionTitle>出演</SectionTitle>
        <Heatmap
          id='人物.跳转'
          data={{
            from: '出演'
          }}
        />
      </View>
      <View style={_.mt.md}>
        {jobs.map((item, index) => (
          <Flex
            key={item.href}
            style={[styles.item, index !== 0 && !_.flat && styles.border]}
            align='start'
          >
            <Flex.Item flex={3}>
              <Flex align='start'>
                <View>
                  <Cover
                    size={coverWidth}
                    height={coverHeight}
                    src={item.cover}
                    radius
                    shadow
                    type={MODEL_SUBJECT_TYPE.getTitle(item.type)}
                    onPress={() =>
                      appNavigate(
                        item.href,
                        navigation,
                        {
                          _jp: item.name,
                          _cn: item.nameCn,
                          _image: item.cover
                        },
                        event
                      )
                    }
                  />
                  {!index && (
                    <Heatmap
                      right={-32}
                      id='人物.跳转'
                      data={{
                        to: 'Subject',
                        alias: '条目'
                      }}
                    />
                  )}
                </View>
                <Flex.Item style={styles.content}>
                  <Flex align='start'>
                    <Text style={_.mt.xs} size={12} bold numberOfLines={3}>
                      {item.name}
                    </Text>
                    <Tag style={styles.tag} value={item.staff} />
                  </Flex>
                  {!!item.nameCn && (
                    <Text style={_.mt.xs} size={10} type='sub' lineHeight={12} bold>
                      {item.nameCn}
                    </Text>
                  )}
                </Flex.Item>
              </Flex>
            </Flex.Item>
            <Flex.Item flex={2}>
              <Flex align='start'>
                <Flex.Item>
                  <Text style={_.mt.xs} size={12} align='right' bold>
                    {item.cast}
                  </Text>
                  {!!item.castTag && (
                    <Text style={_.mt.xs} size={10} type='sub' align='right'>
                      {item.castTag}
                    </Text>
                  )}
                </Flex.Item>
                {!!item.castCover && (
                  <View style={_.ml.sm}>
                    <Image
                      size={40 * _.ratio}
                      src={item.castCover}
                      radius
                      shadow
                      onPress={() =>
                        appNavigate(
                          item.castHref,
                          navigation,
                          {
                            _name: item.cast,
                            _image: getCoverMedium(item.castCover)
                          },
                          event
                        )
                      }
                    />
                  </View>
                )}
                {!index && (
                  <Heatmap
                    id='人物.跳转'
                    data={{
                      to: 'Mono',
                      alias: '人物'
                    }}
                  />
                )}
              </Flex>

              {!!item?.cast2?.cast && (
                <Flex style={_.mt.md} align='start'>
                  <Flex.Item>
                    <Text style={_.mt.xs} size={12} align='right' bold>
                      {item?.cast2?.cast}
                    </Text>
                    {!!item?.cast2?.castTag && (
                      <Text style={_.mt.xs} size={10} type='sub' align='right'>
                        {item?.cast2?.castTag}
                      </Text>
                    )}
                  </Flex.Item>
                  {!!item?.cast2?.castCover && (
                    <View style={_.ml.sm}>
                      <Image
                        size={40 * _.ratio}
                        src={item?.cast2?.castCover}
                        radius
                        shadow
                        onPress={() =>
                          appNavigate(
                            item?.cast2?.castHref,
                            navigation,
                            {
                              _name: item?.cast2?.cast,
                              _image: getCoverMedium(item?.cast2?.castCover)
                            },
                            event
                          )
                        }
                      />
                    </View>
                  )}
                </Flex>
              )}
            </Flex.Item>
          </Flex>
        ))}
      </View>
    </View>
  )
}, defaultProps)

export default obc(({ style }, { $, navigation }) => {
  rerender('Mono.Jobs')

  if (!$.jobs.length) return null

  return <Jobs navigation={navigation} style={style} jobs={$.jobs} />
})

const styles = _.create({
  container: {
    paddingLeft: _.wind,
    paddingBottom: _.md
  },
  item: {
    paddingVertical: _.md,
    paddingRight: _.wind
  },
  content: {
    marginLeft: _.sm + 4
  },
  tag: {
    marginTop: _.xs - 1,
    marginRight: _.sm,
    marginLeft: _.xs
  }
})
