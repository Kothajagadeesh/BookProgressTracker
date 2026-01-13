import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {Book} from '../types';

interface BookCardProps {
  book: Book;
  onPress: () => void;
  variant?: 'small' | 'medium' | 'large';
}

const BookCard: React.FC<BookCardProps> = ({book, onPress, variant = 'medium'}) => {
  const cardStyle = variant === 'small' ? styles.cardSmall : variant === 'large' ? styles.cardLarge : styles.cardMedium;
  const imageStyle = variant === 'small' ? styles.coverSmall : variant === 'large' ? styles.coverLarge : styles.coverMedium;

  return (
    <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
      {book.coverUrl ? (
        <Image source={{uri: book.coverUrl}} style={imageStyle} resizeMode="cover" />
      ) : (
        <View style={[imageStyle, styles.placeholderCover]}>
          <Text style={styles.placeholderEmoji}>📚</Text>
        </View>
      )}
      <Text style={styles.title} numberOfLines={2}>
        {String(book.title || 'Unknown Title')}
      </Text>
      {variant !== 'small' && (
        <Text style={styles.author} numberOfLines={1}>
          {String(book.author || 'Unknown Author')}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Small card (110×180)
  cardSmall: {
    width: 110,
    marginRight: 12,
  },
  coverSmall: {
    width: 110,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  // Medium card (120×190)
  cardMedium: {
    width: 120,
    marginRight: 12,
  },
  coverMedium: {
    width: 120,
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  // Large card (160×240)
  cardLarge: {
    width: 160,
    marginRight: 12,
  },
  coverLarge: {
    width: 160,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  placeholderCover: {
    backgroundColor: '#F2F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default BookCard;
