/*
 * @Author: czy0729
 * @Date: 2019-04-30 18:47:13
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-08-19 16:42:53
 */
import React from 'react'
import { View } from 'react-native'
import { Flex, Text, Touchable, RenderHtml } from '@components'
import { Avatar, Name } from '@screens/_'
import { _ } from '@stores'
import { getTimestamp, open } from '@utils'
import { memo, obc } from '@utils/decorators'
import { appNavigate } from '@utils/app'
import decoder from '@utils/thirdParty/html-entities-decoder'
import { HOST, EVENT } from '@constants'
import UserLabel from '../user-label'
import FloorText from '../floor-text'
import IconExtra from '../icon/extra'
import ItemSub from './sub'

const avatarWidth = 32
const imagesMaxWidth = _.window.width - 2 * _.wind - avatarWidth - _.sm
const expandNum = 4
const defaultProps = {
  navigation: {},
  styles: {},
  authorId: '',
  avatar: '',
  erase: '',
  floor: '',
  id: 0,
  msg: '',
  postId: '', // 存在就跳转到对应楼层
  readedTime: '',
  replySub: '',
  showFixedTextare: false,
  sub: [],
  time: '',
  url: '',
  userId: '',
  userName: '',
  userSign: '',
  isExpand: false,
  isFriend: false,
  isNew: false,
  isAuthor: false,
  isJump: false,
  event: EVENT,
  onToggleExpand: Function.prototype
}

const Item = memo(
  ({
    navigation,
    styles,
    authorId,
    avatar,
    erase,
    floor,
    id,
    msg,
    postId,
    readedTime,
    replySub,
    showFixedTextare,
    sub,
    time,
    url,
    userId,
    userName,
    userSign,
    isExpand,
    isFriend,
    isNew,
    isAuthor,
    isJump,
    event,
    onToggleExpand
  }) => {
    rerender('Topic.Item.Main')

    // 遗留问题, 给宣传语增加一点高度
    const _msg = msg.replace(
      '<span style="font-size:10px; line-height:10px;">[來自Bangumi for',
      '<span style="font-size:10px; line-height:20px;">[來自Bangumi for'
    )
    return (
      <Flex
        style={[_.container.item, isNew && styles.itemNew, isJump && styles.itemJump]}
        align='start'
      >
        <Avatar
          style={styles.image}
          navigation={navigation}
          userId={userId}
          name={userName}
          size={36}
          src={avatar}
          event={event}
        />
        <Flex.Item style={styles.content}>
          <Flex align='start'>
            <Flex.Item>
              <Name
                userId={userId}
                size={userName.length > 10 ? 12 : 14}
                lineHeight={14}
                bold
                right={
                  <UserLabel
                    isAuthor={isAuthor}
                    isFriend={isFriend}
                    userSign={userSign}
                  />
                }
                numberOfLines={1}
              >
                {userName}
              </Name>
            </Flex.Item>
            <IconExtra
              replySub={replySub}
              erase={erase}
              userId={userId}
              userName={userName}
              showFixedTextare={showFixedTextare}
            />
          </Flex>
          <FloorText time={time} floor={floor} />
          <RenderHtml
            style={_.mt.sm}
            baseFontStyle={_.baseFontStyle.md}
            imagesMaxWidth={imagesMaxWidth}
            html={_msg}
            onLinkPress={href => appNavigate(href, navigation, {}, event)}
            onImageFallback={() => open(`${url}#post_${id}`)}
          />
          <View style={styles.sub}>
            {sub
              .filter((item, index) => (isExpand ? true : index < expandNum))
              .map(item => (
                <ItemSub
                  key={item.id}
                  id={item.id}
                  message={item.message}
                  userId={item.userId}
                  userName={item.userName}
                  avatar={item.avatar}
                  floor={item.floor}
                  erase={item.erase}
                  replySub={item.replySub}
                  time={item.time}
                  postId={postId}
                  authorId={authorId}
                  uid={userId}
                  url={url}
                  readedTime={readedTime}
                  showFixedTextare={showFixedTextare}
                  event={event}
                />
              ))}
            {sub.length > expandNum && (
              <Touchable onPress={() => onToggleExpand(id)}>
                <Text
                  style={styles.expand}
                  type={isExpand ? 'sub' : 'main'}
                  size={12}
                  align='center'
                  bold
                >
                  {isExpand ? '收起楼层' : `展开 ${sub.length - expandNum} 条回复`}
                </Text>
              </Touchable>
            )}
          </View>
        </Flex.Item>
      </Flex>
    )
  },
  defaultProps
)

export default obc(
  (
    {
      avatar,
      userId,
      userName,
      replySub,
      message,
      sub,
      id,
      authorId,
      postId,
      time,
      floor,
      userSign,
      erase,
      showFixedTextare,
      event
    },
    { $, navigation }
  ) => {
    rerender('Topic.Item')

    if ($.isBlockUser(userId, userName, replySub)) return null

    const msg = decoder(message)
    if ($.filterDelete && msg.includes('内容已被用户删除')) return null

    const { expands } = $.state
    const isExpand =
      sub.length <= expandNum || (sub.length > expandNum && expands.includes(id))

    const { _time: readedTime } = $.readed
    const isNew = !!readedTime && getTimestamp(time) > readedTime
    const isAuthor = authorId === userId
    const isJump = !!postId && postId === id

    const { _url } = $.params
    const url = _url || `${HOST}/rakuen/topic/${$.topicId}`
    return (
      <Item
        navigation={navigation}
        styles={memoStyles()}
        authorId={authorId}
        avatar={avatar}
        erase={erase}
        floor={floor}
        id={id}
        msg={msg}
        postId={postId}
        readedTime={readedTime}
        replySub={replySub}
        showFixedTextare={showFixedTextare}
        sub={sub}
        time={time}
        url={url}
        userId={userId}
        userName={userName}
        userSign={userSign}
        isExpand={isExpand}
        isFriend={$.myFriendsMap[userId]}
        isNew={isNew}
        isAuthor={isAuthor}
        isJump={isJump}
        event={event}
        onToggleExpand={$.toggleExpand}
      />
    )
  }
)

const memoStyles = _.memoStyles(_ => ({
  itemNew: {
    backgroundColor: _.colorMainLight
  },
  itemJump: {
    borderBottomWidth: 2,
    borderColor: _.colorSuccess
  },
  image: {
    marginTop: _.space,
    marginLeft: _.wind
  },
  content: {
    paddingVertical: _.space,
    paddingRight: _.wind,
    marginLeft: _.sm
  },
  // border: {
  //   borderTopColor: _.colorBorder,
  //   borderTopWidth: _.hairlineWidth
  // },
  sub: {
    marginTop: _.md,
    marginBottom: -_.md
  },
  expand: {
    paddingTop: _.sm,
    paddingBottom: _.md,
    marginLeft: 44
  }
}))
