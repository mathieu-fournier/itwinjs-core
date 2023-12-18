---
tableRowAnchors: true
pageClass: appui-experiment
appuiExperiment: true
---

# Provide UI items

## Overview

[UiItemsProvider]($appui-react) is a mechanism for providing UI elements such as widgets, toolbar, status bar and backstage items to the application.
To create a new provider implement the interface.

```tsx
[[include:AppUI.UiItemsProvider.Imports]]

[[include:AppUI.UiItemsProvider.Provider]]
```

Use the [UiItemsManager]($appui-react) to register a provider.

```tsx
[[include:AppUI.UiItemsProvider.Register]]
```

To limit the scope of the provider to specific frontstages use an override object that contains an array of frontstage ids or stage usages.

```tsx
[[include:AppUI.UiItemsProvider.Override]]
```

## Provide Widgets

Implement [UiItemsProvider.getWidgets]($appui-react) to provide additional widgets to the application. To specify the default location of the [Widget]($appui-react) set the [Widget.layouts]($appui-react) property.

```tsx
[[include:AppUI.UiItemsProvider.Widgets]]
```

### Popout widget

**Popout widget** is a widget opened in a new window popup. To enable this feature set the [Widget.canPopout]($appui-react) property. When enabled the user can open the popout widget by clicking on the popout icon in the widget title bar.

> _Give it a try!_
>
> <iframe style="width:100%;height:400px" src="https://itwin.github.io/appui/storybook/iframe.html?args=&id=widget-canpopout--enabled&viewMode=story"></iframe>

_NOTE:_ widget component must be written in a way that works properly in a window popup. For example `ownerDocument` and `ownerDocument.defaultView` should be used instead of typically used `window` or `document` properties when registering the listeners.

### Floating widget

**Floating widget** is displayed in a dialog like component of the page and is not docked to one of the stage panels. This feature is enabled by default, but you can provide additional options to [Widget.canFloat]($appui-react) property. Since the user is in control of the layout a **docked widget** can be _undocked_ to create a new floating widget. For more information, see [User Interactions](./create-frontstage.md#user-interactions).

## Provide Toolbar Items

Implement [UiItemsProvider.getToolbarItems]($appui-react) to provide additional toolbar items to the application. Set the [ToolbarItem.layouts]($appui-react) property to specify the toolbar to which the [ToolbarItem]($appui-react) should be added. You can use one of [ToolbarItemUtilities]($appui-react) to create a toolbar item of specific type.

```tsx
[[include:AppUI.UiItemsProvider.ToolbarItems]]
```

## Provide StatusBar Items

Implement [UiItemsProvider.getStatusBarItems]($appui-react) to provide additional status bar items to the application. You can use [StatusBarItemUtilities]($appui-react) to create a [StatusBarItem]($appui-react) of specific type.

```tsx
[[include:AppUI.UiItemsProvider.StatusBarItems]]
```

## Provide Backstage Items

Implement [UiItemsProvider.getBackstageItems]($appui-react) to provide additional backstage items to the application. You can use [BackstageItemUtilities]($appui-react) to create a [BackstageItem]($appui-react) of specific type.

```tsx
[[include:AppUI.UiItemsProvider.BackstageItems]]
```

## Use Standard Providers

**AppUI** provides a set of standard providers that you can register to provide standard UI elements to the application: [StandardContentToolsProvider]($appui-react), [StandardNavigationToolsProvider]($appui-react), [StandardStatusbarItemsProvider]($appui-react), [StandardContentToolsUiItemsProvider]($appui-react), [StandardNavigationToolsUiItemsProvider]($appui-react), [StandardStatusbarUiItemsProvider]($appui-react).
