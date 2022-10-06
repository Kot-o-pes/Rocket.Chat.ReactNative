import React from 'react';
import { Text, Pressable } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import shortnameToUnicode from '../../lib/methods/helpers/shortnameToUnicode';
import styles from './styles';
import CustomEmoji from './CustomEmoji';
import scrollPersistTaps from '../../lib/methods/helpers/scrollPersistTaps';
import { IEmoji, IEmojiCategory } from '../../definitions/IEmoji';
import { useTheme } from '../../theme';
import { isIOS } from '../../lib/methods/helpers';
import { useDimensions } from '../../dimensions';

interface IEmojiProps {
	emoji: IEmoji;
	size: number;
	baseUrl: string;
}

const EMOJI_SIZE = 44;

const Emoji = ({ emoji, size, baseUrl }: IEmojiProps): React.ReactElement => {
	if (typeof emoji === 'string')
		return (
			<Text style={[styles.categoryEmoji, { height: size, width: size, fontSize: size - 14 }]}>
				{shortnameToUnicode(`:${emoji}:`)}
			</Text>
		);
	return (
		<CustomEmoji style={[styles.customCategoryEmoji, { height: size - 16, width: size - 16 }]} emoji={emoji} baseUrl={baseUrl} />
	);
};

const EmojiCategory = ({ baseUrl, onEmojiSelected, emojis }: IEmojiCategory): React.ReactElement | null => {
	const { colors } = useTheme();
	const { width } = useDimensions();

	const numColumns = Math.trunc(width / EMOJI_SIZE);
	const marginHorizontal = (width % EMOJI_SIZE) / 2;

	const renderItem = (emoji: IEmoji) => (
		<Pressable
			key={typeof emoji === 'string' ? emoji : emoji.content}
			onPress={() => onEmojiSelected(emoji)}
			testID={`emoji-${typeof emoji === 'string' ? emoji : emoji.content}`}
			android_ripple={{ color: colors.bannerBackground, borderless: true, radius: EMOJI_SIZE / 2 }}
			style={({ pressed }: { pressed: boolean }) => ({
				backgroundColor: isIOS && pressed ? colors.bannerBackground : 'transparent'
			})}
		>
			<Emoji emoji={emoji} size={EMOJI_SIZE} baseUrl={baseUrl} />
		</Pressable>
	);

	if (!width) {
		return null;
	}

	return (
		<FlatList
			// rerender FlatList in case of width changes
			key={`emoji-category-${width}`}
			keyExtractor={item => (typeof item === 'string' ? item : item.content)}
			data={emojis}
			extraData={{ baseUrl, width }}
			renderItem={({ item }) => renderItem(item)}
			numColumns={numColumns}
			initialNumToRender={45}
			removeClippedSubviews
			contentContainerStyle={{ marginHorizontal }}
			{...scrollPersistTaps}
			keyboardDismissMode={'none'}
		/>
	);
};

export default EmojiCategory;
