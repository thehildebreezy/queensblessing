import QtQuick 2.0
import QtQuick.Controls 2.0

Page {

    property StackView stackID
    property RecipeList nextView

    header: Label {
        text: "Home"
    }

    Rectangle {
        anchors.fill: parent
        Text {
            text: "Test"
        }
        Button {
            text: "Next"
            onClicked: stackID.push(nextView)
        }
    }

    footer: Label {
        text: "Footer"
    }
}