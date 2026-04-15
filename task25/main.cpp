#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 0;
    cin >> n;
    string s;
    cin >> s;

    int count_a = 0;
    int nim_sum = 0;

    for (int i = 0; i < n; ) {
        if (s[i] == 'A') {
            ++count_a;
            ++i;
            continue;
        }

        int j = i;
        while (j < n && s[j] == 'B') {
            ++j;
        }
        nim_sum ^= (j - i);
        i = j;
    }

    if (count_a % 2 == 0) {
        cout << -1 << '\n';
    } else if (nim_sum != 0) {
        cout << 'A' << '\n';
    } else {
        cout << 'B' << '\n';
    }

    return 0;
}
