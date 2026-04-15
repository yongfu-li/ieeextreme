#include <iostream>
#include <vector>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    long long n = 0;
    std::cin >> n;

    const std::vector<int> pattern = {1, 2, 3, 1, 2, 3, 1, 2, 3, 4};
    const long long idx = (n - 1) % static_cast<long long>(pattern.size());

    std::cout << pattern[static_cast<std::size_t>(idx)] << '\n';
    return 0;
}
