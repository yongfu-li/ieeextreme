#include <iostream>
#include <numeric>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    long long a = 0;
    long long b = 0;
    std::cin >> a >> b;

    std::cout << std::gcd(a, b) << '\n';
    return 0;
}
