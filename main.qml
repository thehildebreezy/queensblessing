import QtQuick 2.0
import QtQuick.Controls 2.0

ApplicationWindow {
    visible: true
    width: 400
    height: 400


    StackView {
        id: stack
        initialItem: homeScreen
        anchors.fill: parent
    }

    Home {
        id: homeScreen
        stackID: stack
        nextView: recipeList
    }

    RecipeList {
        visible: false
        stackID: stack
        id: recipeList
    }
}