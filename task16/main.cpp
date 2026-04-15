#include <cstdint>
#include <iostream>
#include <string>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    std::string gray;
    std::cin >> gray;

    std::uint64_t answer = 0;
    int current_binary_bit = 0;

    for (const char ch : gray) {
        const int gray_bit = ch - '0';
        current_binary_bit ^= gray_bit;
        answer = (answer << 1U) | static_cast<std::uint64_t>(current_binary_bit);
    }

    std::cout << answer << '\n';
    return 0;
}
