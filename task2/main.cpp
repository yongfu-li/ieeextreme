#include <iostream>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    long long a = 0;
    long long b = 0;
    std::cin >> a >> b;
    std::cout << (a + b) << '\n';

    return 0;
}
