import React from 'react'
import {
  StyleSheet,
  View,
  FlatList,
  KeyboardAvoidingView,
  AsyncStorage
} from 'react-native'
import {
  CheckBox,
  Input,
  Text,
  ListItem,
  Button,
  Icon
} from 'react-native-elements'
import { ScrollView } from 'react-native-gesture-handler'

// Remove annoying debug warning
console.ignoredYellowBox = ['Remote debugger']

export default class App extends React.Component {
  state = { text: '', todos: [] }

  async componentDidMount() {
    const todos = await this.loadState()
    this.setState({ todos })
  }

  handleInput = text => this.setState({ text })

  handleSubmit = e => {
    this.addTodo(e.nativeEvent.text)
    this.setState({ text: '' })
  }

  handleTodoPress = (id, text) => async e => {
    console.log('an item will be edited/deleted!')
    console.log(id)
    console.log(text)
    const todos = this.state.todos.map(
      todo => (todo.id === id ? { ...todo, isEditing: true } : todo)
    )
    await this.setState({ todos })
  }

  addTodo = async text => {
    await this.setState(prevState => ({
      todos: [
        ...prevState.todos,
        {
          id:
            this.state.todos.reduce(
              (maxId, todo) => Math.max(todo.id, maxId),
              -1
            ) + 1,
          isDone: false,
          isEditing: false,
          text
        }
      ]
    }))
    this.saveState()
  }

  toggleTodo = id => async e => {
    const todos = this.state.todos.map(
      todo => (todo.id === id ? { ...todo, isDone: !todo.isDone } : todo)
    )
    await this.setState({ todos })
    this.saveState()
  }

  editTodo = async (id, text) => {
    const todos = this.state.todos.map(
      todo => (todo.id === id ? { ...todo, text, isEditing: false } : todo)
    )
    await this.setState({ todos })
    this.saveState()
  }

  deleteTodo = id => async e => {
    const todos = this.state.todos.filter(todo => todo.id !== id)
    await this.setState({ todos })
    this.saveState()
  }

  loadState = async () => {
    try {
      const serializedState = await AsyncStorage.getItem('todos')
      if (serializedState === null) return undefined
      console.log(JSON.parse(serializedState))
      return JSON.parse(serializedState)
    } catch (err) {
      return undefined
    }
  }

  saveState = async () => {
    try {
      const todos = await this.state.todos
      const serializedState = await JSON.stringify(todos)
      console.log(JSON.parse(serializedState))
      await AsyncStorage.setItem('todos', serializedState)
    } catch (err) {
      console.log(err)
    }
  }

  handleEdit = id => e => {
    const text = e.nativeEvent.text
    if (text.length === 0) {
      this.deleteTodo(id)
    } else {
      this.editTodo(id, text)
    }
  }

  renderItem = (item, separators) => {
    if (!item.isEditing) {
      return (
        <ListItem
          title={item.text}
          titleStyle={item.isDone ? { textDecorationLine: 'line-through' } : {}}
          subtitle="Touch to edit"
          subtitleStyle={{ color: '#999' }}
          bottomDivider={true}
          onPress={this.handleTodoPress(item.id, item.text)}
          leftElement={
            <CheckBox
              checked={item.isDone}
              onPress={this.toggleTodo(item.id)}
            />
          }
          rightElement={
            <Button title="Remove" onPress={this.deleteTodo(item.id)} />
          }
        />
      )
    } else {
      return (
        <ListItem
          title={
            <Input
              onSubmitEditing={this.handleEdit(item.id, item.text)}
              value={item.text}
              placeholder="Edit your todo"
            />
          }
          bottomDivider={true}
          onPress={this.handleTodoPress(item.id, item.text)}
          leftElement={<Icon name="mode-edit" />}
          rightElement={
            <Button
              title="Remove"
              onPress={this.deleteTodo(item.id)}
              disabled={true}
            />
          }
        />
      )
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text h1 style={{ textAlign: 'center' }}>
          Todo App
        </Text>
        <Input
          onChangeText={this.handleInput}
          onSubmitEditing={this.handleSubmit}
          value={this.state.text}
          placeholder="Type your new todo"
          autoFocus={true}
          blurOnSubmit={false}
          shake={true}
          containerStyle={{ alignSelf: 'center' }}
        />
        <KeyboardAvoidingView behavior="padding" enabled>
          <FlatList
            data={this.state.todos}
            keyExtractor={(item, index) => item.id + ''}
            ListHeaderComponent={
              this.state.todos.length > 0 ? (
                <Text h4 style={styles.todosTitle}>
                  Your todos
                </Text>
              ) : null
            }
            extraData={this.state.todos}
            renderItem={({ item, separators }) =>
              this.renderItem(item, separators)
            }
          />
        </KeyboardAvoidingView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#fefefe'
  },
  todosTitle: {
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: '#dedede',
    color: '#000',
    paddingTop: 4,
    paddingBottom: 4
  }
})
