🗨 用js实现限制多行文字的行数。

</br></br>

🍧 简单例子：
</br></br>

$clamp('#test', {clamp: 3})

$clamp('#test', {clamp: 3，tail:">?"})</br>
//用>?结尾，默认是...</br>

$clamp('#test', {clamp: 3，tailHtml："\<a href = 
'https://github.com/josephschmitt/Clamp.js'>aa<\/a\>"})</br>
//以html标签结尾</br>

$clamp('#test', {clamp: 3，useNative: true})</br>
//用wekit的非标准属性,不能使用useNative和tail选项</br>



🌀 思路：</br>
</br>
  https://github.com/josephschmitt/Clamp.js的思路
是递归innerHtml，每次减少一个字，直到通过整个元素高度
小于lineHeight * clamp的行数。
  这个小插件使用相反的思路，先创建元素，在里面插入一个
字计算出一个字的宽度（中文，英文和标点等），然后根据行数
和元素宽度计算出能插入多少个元素
