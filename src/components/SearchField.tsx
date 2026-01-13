import React from 'react';
import {View, TextInput, StyleSheet, TouchableOpacity, TextInputProps} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../context/ThemeContext';

interface SearchFieldProps extends TextInputProps {
  onClear?: () => void;
  showClear?: boolean;
}

const SearchField: React.FC<SearchFieldProps> = ({onClear, showClear, ...props}) => {
  const {theme: colors} = useTheme();
  
  return (
    <View style={[styles.container, {backgroundColor: colors.surface, borderColor: colors.border}]}>
      <TextInput
        style={[styles.input, {color: colors.text}]}
        placeholderTextColor={colors.textTertiary}
        {...props}
      />
      {showClear && onClear && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Icon name="close-circle" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: 0,
    marginVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
  },
});

export default SearchField;
