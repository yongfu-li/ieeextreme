#include <iostream>
#include <vector>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n = 0;
    std::cin >> n;

    std::vector<int> values(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> values[i];
    }

    std::vector<int> dec_left(n, 1);
    for (int i = 1; i < n; ++i) {
        if (values[i - 1] > values[i]) {
            dec_left[i] = dec_left[i - 1] + 1;
        }
    }

    std::vector<int> dec_right(n, 1);
    for (int i = n - 2; i >= 0; --i) {
        if (values[i] > values[i + 1]) {
            dec_right[i] = dec_right[i + 1] + 1;
        }
    }

    for (int i = 0; i < n; ++i) {
        const int answer = dec_left[i] + dec_right[i] - 1;
        std::cout << answer << (i + 1 == n ? '\n' : ' ');
    }

    return 0;
}
