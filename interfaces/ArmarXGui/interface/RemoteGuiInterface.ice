/*
 * This file is part of ArmarX.
 *
 * ArmarX is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2 as
 * published by the Free Software Foundation.
 *
 * ArmarX is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * @package    RobotAPI::ArmarXGui
 * @author     Fabian Paus (fabian dot paus at kit dot edu)
 * @date       2018
 * @copyright  http://www.gnu.org/licenses/gpl-2.0.txt
 *             GNU General Public License
 */
#pragma once

#include <Ice/BuiltinSequences.ice>

module armarx
{
    module RemoteGui
    {
        enum ValueVariantType
        {
            VALUE_VARIANT_EMPTY,
            VALUE_VARIANT_BOOL,
            VALUE_VARIANT_INT,
            VALUE_VARIANT_FLOAT,
            VALUE_VARIANT_STRING,
            VALUE_VARIANT_VECTOR3,
            VALUE_VARIANT_MATRIX4,
        };

        struct ValueVariant
        {
            ValueVariantType type = VALUE_VARIANT_EMPTY;
            int i = 0;
            float f = 0.0f;
            string s;
            Ice::FloatSeq v;
        };

        dictionary <string, ValueVariant> ValueMap;
        dictionary <string, ValueMap> TabValueMap;
        dictionary <string, bool> DirtyMap;
        dictionary <string, DirtyMap> TabDirtyMap;


        struct WidgetState
        {
            bool hidden = false;
            bool disabled = false;
        };

        dictionary <string, WidgetState> WidgetStateMap;
        dictionary <string, WidgetStateMap> TabWidgetStateMap;

        // Widget definitions

        class Widget;
        sequence <Widget> WidgetSeq;

        class Widget
        {
            string name;
            ValueVariant defaultValue;
            WidgetState defaultState;
            WidgetSeq children;
        };

        class WidgetWithToolTip extends Widget
        {
            string toolTip;
        };

        // Layouts
        class HBoxLayout extends Widget
        {
        };
        class VBoxLayout extends Widget
        {
        };
        class SimpleGridLayoutSpanningChild extends Widget
        {
            int columns = 1;
        };
        class SimpleGridLayout extends Widget
        {
            int columns = 1;
        };
        struct GridLayoutData
        {
            int row;
            int col;
            int spanRow;
            int spanCol;
        };
        sequence<GridLayoutData> GridLayoutDataSeq;

        class GridLayout extends Widget
        {
            GridLayoutDataSeq childrenLayoutInfo;
        };

        class GroupBox extends Widget
        {
            string label;
            bool collapsed = false;
        };

        // Static elements
        class HSpacer extends Widget
        {
        };
        class VSpacer extends Widget
        {
        };
        class HLine extends Widget
        {
        };
        class VLine extends Widget
        {
        };

        // Widgets with values

        // Bool
        class CheckBox extends WidgetWithToolTip
        {
            string label;
        };

        class ToggleButton extends WidgetWithToolTip
        {
            string label;
        };

        // Integer
        class IntSpinBox extends WidgetWithToolTip
        {
            int min = 0;
            int max = 0;
        };

        class IntSlider extends WidgetWithToolTip
        {
            int min = 0;
            int max = 0;
        };

        class Button extends WidgetWithToolTip
        {
            string label;
        };

        // Float
        class FloatSpinBox extends WidgetWithToolTip
        {
            float min = 0;
            float max = 0;
            int steps = 100;
            int decimals = 3;
        };

        class FloatSlider extends WidgetWithToolTip
        {
            float min = 0;
            float max = 0;
            int steps = 100;
        };

        // String
        class Label extends WidgetWithToolTip
        {
        };
        class LineEdit extends WidgetWithToolTip
        {
        };

        class ComboBox extends WidgetWithToolTip
        {
            Ice::StringSeq options;
        };

        struct Vector3f
        {
            float x;
            float y;
            float z;
        };

        struct Vector3i
        {
            int x;
            int y;
            int z;
        };


        //Vector3f
        class Vector3fSpinBoxes extends WidgetWithToolTip
        {
            Vector3f min;
            Vector3f max;
            Vector3i steps;
            Vector3i decimals;
        };

        //Matrix4f
        class PosRPYSpinBoxes extends WidgetWithToolTip
        {
            Vector3f minPos;
            Vector3f maxPos;
            Vector3f minRPY;
            Vector3f maxRPY;
            Vector3i stepsPos;
            Vector3i decimalsPos;
            Vector3i stepsRPY;
            Vector3i decimalsRPY;
        };

        dictionary <string, Widget> WidgetMap;
    };

    interface RemoteGuiInterface
    {
        string getTopicName();

        void createTab(string tab, RemoteGui::Widget rootWidget);

        void removeTab(string tab);

        RemoteGui::WidgetMap getTabs();
        RemoteGui::TabWidgetStateMap getTabStates();
        RemoteGui::TabValueMap getValuesForAllTabs();

        void setValue(string tab, string widgetName, RemoteGui::ValueVariant value);

        RemoteGui::ValueMap getValues(string tab);
        void setValues(string tab, RemoteGui::ValueMap values);

        RemoteGui::WidgetStateMap getWidgetStates(string tab);
        void setWidgetStates(string tab, RemoteGui::WidgetStateMap widgetState);
    };

    interface RemoteGuiListenerInterface
    {
        void reportTabChanged(string tab);

        void reportTabsRemoved();

        void reportStateChanged(string tab, RemoteGui::ValueMap valueDelta);

        void reportWidgetChanged(string tab, RemoteGui::WidgetStateMap stateDelta);
    };

};

