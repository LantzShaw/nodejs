const add = (a, b) => {
    if (a && b) {
        return a + b;
    }
    throw new Error('程序中fasf断');
};

try {
    console.log(add(1));
} catch (error) {
    console.log('程序中断');
}
console.log('测试');
