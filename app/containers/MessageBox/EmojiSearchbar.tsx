import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { orderBy } from 'lodash';

import FormTextInput from '../TextInput/FormTextInput';
import { useTheme } from '../../theme';
import I18n from '../../i18n';
import { CustomIcon } from '../CustomIcon';
import { IEmoji } from '../../definitions';
import shortnameToUnicode from '../../lib/methods/helpers/shortnameToUnicode';
import CustomEmoji from '../EmojiPicker/CustomEmoji';
import database from '../../lib/database';

interface IEmojiSearchbarProps {
	openEmoji: () => void;
	onChangeText: (value: string) => void;
	emojis: IEmoji[];
	onEmojiSelected: (emoji: IEmoji) => void;
	baseUrl: string;
}

const renderEmoji = (emoji: IEmoji, size: number, baseUrl: string) => {
	if (emoji.name) {
		return <CustomEmoji style={{ height: size, width: size }} emoji={emoji} baseUrl={baseUrl} />;
	}
	return <Text style={{ fontSize: size }}>{shortnameToUnicode(`:${emoji}:`)}</Text>;
};

const EmojiSearchbar = React.forwardRef<TextInput, IEmojiSearchbarProps>(
	({ openEmoji, onChangeText, emojis, onEmojiSelected, baseUrl }, ref) => {
		console.log('Emojis', emojis);
		const { colors, theme } = useTheme();
		const [searchText, setSearchText] = useState<string>('');
		const [frequentlyUsed, setFrequentlyUsed] = useState([]);

		const getFrequentlyUsedEmojis = async () => {
			const db = database.active;
			const frequentlyUsedRecords = await db.get('frequently_used_emojis').query().fetch();
			const frequentlyUsedOrdered = orderBy(frequentlyUsedRecords, ['count'], ['desc']);
			const frequentlyUsedEmojis = frequentlyUsedOrdered.map(item => {
				if (item.isCustom) {
					return { name: item.content, extension: item.extension };
				}
				return item.content;
			});
			// @ts-ignore
			setFrequentlyUsed(frequentlyUsedEmojis);
		};

		useEffect(() => {
			getFrequentlyUsedEmojis();
		}, []);

		const handleTextChange = (text: string) => {
			setSearchText(text);
			onChangeText(text);
			if (!text) getFrequentlyUsedEmojis();
		};

		const renderItem = (emoji: IEmoji) => {
			const emojiSize = 30;
			return (
				<View style={{ justifyContent: 'center', marginHorizontal: 2 }}>
					<TouchableOpacity
						activeOpacity={0.7}
						// @ts-ignore
						key={emoji && emoji.isCustom ? emoji.content : emoji}
						onPress={() => onEmojiSelected(emoji)}>
						{renderEmoji(emoji, emojiSize, baseUrl)}
					</TouchableOpacity>
				</View>
			);
		};
		return (
			<View>
				<View style={{ height: 50, paddingHorizontal: 5 }}>
					<FlatList horizontal data={searchText ? emojis : frequentlyUsed} renderItem={({ item }) => renderItem(item)} />
				</View>
				<View
					style={{
						flexDirection: 'row',
						height: 50,
						marginVertical: 10,
						justifyContent: 'center',
						alignItems: 'center'
					}}>
					<TouchableOpacity
						style={{ marginHorizontal: 10, justifyContent: 'center', height: '100%' }}
						activeOpacity={0.7}
						onPress={openEmoji}>
						<CustomIcon name='chevron-left' size={30} color={colors.collapsibleChevron} />
					</TouchableOpacity>
					<View style={{ flex: 1 }}>
						<FormTextInput
							inputRef={ref}
							autoCapitalize='none'
							autoCorrect={false}
							blurOnSubmit
							placeholder={I18n.t('Search_emoji')}
							returnKeyType='search'
							underlineColorAndroid='transparent'
							onChangeText={handleTextChange}
							style={{ backgroundColor: colors.passcodeButtonActive, padding: 10, borderRadius: 5 }}
							containerStyle={{ height: '100%', justifyContent: 'center', marginBottom: 0, marginRight: 15 }}
							value={searchText}
							theme={theme}
							onClearInput={() => handleTextChange('')}
							iconRight={'search'}
						/>
					</View>
				</View>
			</View>
		);
	}
);

export default EmojiSearchbar;
