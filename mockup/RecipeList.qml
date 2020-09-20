import QtQuick 2.0
import QtQuick.Controls 2.0

Page {

    property StackView stackID

    header: Label {
        text: "Recipe List"
    }

    Rectangle {
        anchors.fill: parent
        Text {
            text: "List of recipes"
        }
        Button {
            text: "Pop"
            onClicked: stackID.pop()
        }
    }

    footer: Label {
        text: "Footer"
    }
}